// /lib/energy/rollups.ts
import Reading from '@/models/Reading';
import KpiDaily from '@/models/KpiDaily';
import KpiShift from '@/models/KpiShift';
import KpiMonthly from '@/models/KpiMonthly';
import EventOutage from '@/models/EventOutage';
import EventOverlap from '@/models/EventOverlap';
import { toYMD, toYM, floor5m, minutesBetween } from './util';
import { getActiveCost, applyCostsPerDay } from './costs';

// Device type helpers
const ASEB = 'ASEB';
const DG_DIESEL = 'DG_DIESEL';
const DG_GAS = 'DG_GAS';

// infer shift by time (A 06-14, B 14-22, C 22-06) – will be replaced by config endpoint data when put
const DEFAULT_SHIFTS = [
  { name: 'A', start: '06:00', end: '14:00' },
  { name: 'B', start: '14:00', end: '22:00' },
  { name: 'C', start: '22:00', end: '06:00' },
];

function timeStrToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function whichShift(date: Date, shifts = DEFAULT_SHIFTS) {
  const mins = date.getHours() * 60 + date.getMinutes();
  for (const s of shifts) {
    const a = timeStrToMin(s.start);
    const b = timeStrToMin(s.end);
    if (a <= b) {
      if (mins >= a && mins < b) return s.name;
    } else {
      // cross-midnight
      if (mins >= a || mins < b) return s.name;
    }
  }
  return 'A';
}

export async function rollupDaily({ locationRef, from, to }: { locationRef: any, from: Date, to: Date }) {
  // aggregate per device per day
  const rows = await Reading.aggregate([
    { $match: { locationRef, timestamp: { $gte: from, $lte: to } } },
    { $sort: { deviceRef:1, timestamp:1 } },
    {
      $group: {
        _id: { deviceRef: '$deviceRef', day: { $dateToString: { date: '$timestamp', format: '%Y-%m-%d', timezone: 'Asia/Kolkata' } } },
        first: { $first: '$$ROOT' },
        last:  { $last:  '$$ROOT' },
        kwh:   { $sum: '$kw_inst' }, // not ideal; kwh is from deltas, but when not available fallback
        kwh_cum: { $push: '$meter_kwh_cum' },
        diesel_cum: { $push: '$diesel_liters_cum' },
        gas_est: { $sum: '$gas_nm3_est' },
        peak_kw: { $max: '$kw_inst' },
      }
    }
  ]);

  const ops:any[] = [];
  for (const r of rows) {
    const date = r._id.day;
    // deltas for kwh and diesel liters
    const kwhDelta = seriesDelta(r.kwh_cum);
    const dieselDelta = seriesDelta(r.diesel_cum);
    const kwh_total = kwhDelta.reduce((a: number, b: number) => a + b, 0);
    const diesel_total = dieselDelta.reduce((a: number, b: number) => a + b, 0);

    // naive type split (we’ll decide by device type downstream via lookup when rendering; here store into diesel or grid/gas?)
    // For daily we can store only totals at location level; device-level uniqueness maintained by index.

    ops.push({
      updateOne: {
        filter: { locationRef, deviceRef: r._id.deviceRef, date },
        update: {
          $set: {
            kwh_aseb: 0,
            kwh_diesel: 0,
            kwh_gas: 0,
            diesel_l: diesel_total,
            gas_nm3: r.gas_est || 0,
            sfc_diesel: kwh_total > 0 ? (diesel_total / kwh_total) : 0,
            sfc_gas: kwh_total > 0 ? ((r.gas_est || 0) / kwh_total) : 0,
            minutes_outage: 0,
            minutes_overlap: 0,
            peak_kw: r.peak_kw || 0,
          }
        },
        upsert: true
      }
    });
  }
  if (ops.length) await KpiDaily.bulkWrite(ops, { ordered: false });
}

function seriesDelta(series: number[] = []) {
  const out: number[] = [];
  let prev: number | null = null;
  for (const v of series) {
    if (typeof v !== 'number') { out.push(0); continue; }
    if (prev === null) { out.push(0); prev = v; continue; }
    const d = v - prev;
    out.push(d >= 0 && d < 1e8 ? d : 0);
    prev = v;
  }
  return out;
}

// Placeholder shift & monthly rollups (simple derivations from daily for MVP)
export async function rollupMonthly({ locationRef, ym }: { locationRef: any, ym: string }) {
  const days = await KpiDaily.find({ locationRef, date: { $regex: `^${ym}` } }).lean();
  const sum = (k: string) => days.reduce((a: number, d: any) => a + (d[k] || 0), 0);
  await KpiMonthly.updateOne(
    { locationRef, yearMonth: ym },
    {
      $set: {
        kwh_aseb: sum('kwh_aseb'),
        kwh_diesel: sum('kwh_diesel'),
        kwh_gas: sum('kwh_gas'),
        diesel_l: sum('diesel_l'),
        gas_nm3: sum('gas_nm3'),
        sfc_diesel: 0, sfc_gas: 0, // can be derived later as ratios
        minutes_outage: sum('minutes_outage'),
        minutes_overlap: sum('minutes_overlap'),
        cost_total: sum('cost_total'),
        cost_grid: sum('cost_grid'),
        cost_diesel: sum('cost_diesel'),
        cost_gas: sum('cost_gas'),
      }
    },
    { upsert: true }
  );
}

export async function applyCostsForDay({ locationRef, dateStr }:{locationRef:any, dateStr:string}) {
  const day = await KpiDaily.find({ locationRef, date: dateStr }).lean();
  const anyDoc = day[0];
  const at = new Date(dateStr + 'T12:00:00+05:30');
  const cfg = await getActiveCost(locationRef, at);

  const ops:any[] = [];
  for (const d of day) {
    const parts = applyCostsPerDay({
      cfg,
      kwh_aseb: d.kwh_aseb || 0,
      kwh_diesel: d.kwh_diesel || 0,
      kwh_gas: d.kwh_gas || 0,
      diesel_l: d.diesel_l || 0,
      gas_nm3: d.gas_nm3 || 0,
    });
    ops.push({
      updateOne: { filter: { _id: d._id }, update: { $set: {
        cost_total: parts.total, cost_grid: parts.grid,
        cost_diesel: parts.diesel, cost_gas: parts.gas
      } } }
    });
  }
  if (ops.length) await KpiDaily.bulkWrite(ops, { ordered:false });
}
