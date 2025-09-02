// /app/energy/shifts/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DateRange from '@/components/DateRange';
import Card from '@/components/Card';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const [locationId, setLocationId] = useState('');
  const [range,setRange] = useState<{from:string,to:string}>(()=> {
    const d = new Date(); const to = d.toISOString().slice(0,10);
    d.setDate(d.getDate()-7); const from = d.toISOString().slice(0,10);
    return {from,to};
  });
  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  useEffect(()=>{ if (locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs]);

  const { data } = useSWR(token && locationId ? [`/api/kpi/shift?location=${locationId}&from=${range.from}&to=${range.to}`, token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  const rows = (data?.items||[]);

  return (
    <Guard>
      <h2>Shift Analytics</h2>
      <div className="row" style={{gap:12}}>
        <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
          {(locs?.locations||[]).map((l:any)=><option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
        <DateRange value={range} onChange={setRange}/>
      </div>
      <div className="space" />
      <div className="card" style={{overflowX:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Shift</th><th>kWh ASEB</th><th>kWh DG Diesel</th><th>kWh DG Gas</th>
              <th>Diesel L</th><th>Gas Nm³</th><th>SFC Diesel</th><th>SFC Gas</th><th>Outage min</th><th>Overlap min</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(<tr key={r._id}>
              <td>{r.date}</td><td>{r.shift}</td><td>{fmt(r.kwh_aseb)}</td><td>{fmt(r.kwh_diesel)}</td><td>{fmt(r.kwh_gas)}</td>
              <td>{fmt(r.diesel_l)}</td><td>{fmt(r.gas_nm3)}</td><td>{fmt(r.sfc_diesel,3)}</td><td>{fmt(r.sfc_gas,3)}</td><td>{r.minutes_outage||0}</td><td>{r.minutes_overlap||0}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
function fmt(n:number, d=2){ return (n||0).toFixed(d); }
