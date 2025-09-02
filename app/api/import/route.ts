// /app/api/import/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import Reading from '@/models/Reading';
import ImportJob from '@/models/ImportJob';
import { PRESETS, parseCsv, applyMonotonicDelta } from '@/lib/energy/csv';
import { floor5m } from '@/lib/energy/util';
import { Device, Location } from '@/lib/models';

function pickPreset(name: string) {
  if (name in PRESETS) return (PRESETS as any)[name];
  throw new Error('Unknown preset');
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const presetName = String(form.get('preset') || 'DG_ENERGY');
  const deviceId = String(form.get('deviceId') || '');
  const locationId = String(form.get('locationId') || '');
  const files = form.getAll('files').filter(Boolean) as File[];

  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });
  if (!deviceId || !locationId) return NextResponse.json({ error: 'deviceId & locationId required' }, { status: 400 });

  const device = await Device.findById(deviceId).lean();
  const location = await Location.findById(locationId).lean();
  if (!device || !location) return NextResponse.json({ error:'Bad location/device' }, { status:400 });

  const mapping = pickPreset(presetName as any);

  let rowsIn=0, rowsOk=0, rowsDup=0, rowsBad=0;
  const fileNames: string[] = [];
  let minTs: Date | undefined, maxTs: Date | undefined;

  for (const file of files) {
    fileNames.push(file.name);
    const buf = Buffer.from(await file.arrayBuffer());
    // try utf8, fall back latin1
    let text = buf.toString('utf8');
    if (/[^\x00-\x7F]/.test(text) && !text.includes('\n')) {
      text = buf.toString('latin1');
    }
    const rows = parseCsv(text, mapping);
    rowsIn += rows.length;

    // compute deltas for cumulative fields
    // 5-min bin normalization
    const byBin = new Map<number, any>();
    const kwhSeries: (number|undefined)[] = rows.map(r => r.meter_kwh_cum);
    const dieselSeries: (number|undefined)[] = rows.map(r => r.diesel_liters_cum);
    const kwhDelta = applyMonotonicDelta(kwhSeries);
    const dieselDelta = applyMonotonicDelta(dieselSeries);

    rows.forEach((r, i) => {
      const ts5 = floor5m(r.timestamp).getTime();
      const rec = byBin.get(ts5) || { timestamp: new Date(ts5) };
      if (kwhDelta[i] !== undefined)     rec.kwh_delta = (rec.kwh_delta || 0) + (kwhDelta[i] || 0);
      if (dieselDelta[i] !== undefined)  rec.diesel_delta = (rec.diesel_delta || 0) + (dieselDelta[i] || 0);
      rec.kw_inst = Math.max(rec.kw_inst || 0, r.kw_inst || 0);
      rec.raw = r.raw || rec.raw;
      byBin.set(ts5, rec);
    });

    // write readings idempotently
    for (const rec of byBin.values()) {
      try {
        const doc: any = {
          locationRef: locationId,
          deviceRef: deviceId,
          timestamp: rec.timestamp,
          kw_inst: rec.kw_inst ?? undefined,
          source: 'import',
          raw: rec.raw || undefined,
        };
        // reconstruct cumulative? store deltas in diesel_liters_inst; meter_kwh_cum not available – keep deltas driving KPIs
        if (rec.kwh_delta !== undefined) doc.meter_kwh_cum = undefined; // optional
        if (rec.kwh_delta !== undefined) doc.run_flag = (rec.kwh_delta || 0) > 0 ? 1 : 0;
        if (rec.diesel_delta !== undefined) doc.diesel_liters_inst = rec.diesel_delta;

        await Reading.updateOne(
          { locationRef: locationId, deviceRef: deviceId, timestamp: rec.timestamp },
          { $set: doc },
          { upsert: true }
        );
        rowsOk++;
        if (!minTs || rec.timestamp < minTs) minTs = rec.timestamp;
        if (!maxTs || rec.timestamp > maxTs) maxTs = rec.timestamp;
      } catch (e: any) {
        if (e?.code === 11000) rowsDup++;
        else rowsBad++;
      }
    }
  }

  const job = await ImportJob.create({
    userRef: tok.sub,
    locationRef: locationId,
    deviceRef: deviceId,
    presetName, fileNames, rowsIn, rowsOk, rowsDup, rowsBad,
    fromTs: minTs, toTs: maxTs, status: 'done'
  });

  // NOTE: full rollup engine (daily/shift/monthly + costs) is provided in /lib/energy/rollups.ts.
  // To keep the request responsive on Replit, you can hit the recompute endpoints or run a small queue later.

  return NextResponse.json({ ok: true, jobId: String(job._id), rowsIn, rowsOk, rowsDup, rowsBad, fromTs:minTs, toTs:maxTs });
}
