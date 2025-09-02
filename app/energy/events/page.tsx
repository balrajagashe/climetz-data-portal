// /app/energy/events/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DateRange from '@/components/DateRange';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const [locationId, setLocationId] = useState('');
  const [range,setRange] = useState<{from:string,to:string}>(()=> {
    const d = new Date(); const to = d.toISOString().slice(0,10);
    d.setDate(d.getDate()-7); const from = d.toISOString().slice(0,10);
    return {from,to};
  });
  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  useEffect(()=>{ if (locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs]);

  const outages = useSWR(token && locationId ? [`/api/events/outages?location=${locationId}&from=${range.from}&to=${range.to}`, token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  const overlaps = useSWR(token && locationId ? [`/api/events/overlap?location=${locationId}&from=${range.from}&to=${range.to}`, token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  return (
    <Guard>
      <h2>Events</h2>
      <div className="row" style={{gap:12}}>
        <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
          {(locs?.locations||[]).map((l:any)=><option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
        <DateRange value={range} onChange={setRange}/>
      </div>

      <div className="space" />
      <div className="grid grid-2">
        <div className="card" style={{overflowX:'auto'}}>
          <strong>Outages</strong>
          <table className="table"><thead><tr><th>Start</th><th>End</th><th>Minutes</th></tr></thead>
            <tbody>{(outages.data?.items||[]).map((e:any,i:number)=><tr key={i}><td>{fmt(e.start)}</td><td>{fmt(e.end)}</td><td>{e.minutes}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card" style={{overflowX:'auto'}}>
          <strong>Overlap (Grid + DG)</strong>
          <table className="table"><thead><tr><th>Start</th><th>End</th><th>Minutes</th></tr></thead>
            <tbody>{(overlaps.data?.items||[]).map((e:any,i:number)=><tr key={i}><td>{fmt(e.start)}</td><td>{fmt(e.end)}</td><td>{e.minutes}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </Guard>
  );
}
function fmt(s:string){ return new Date(s).toLocaleString(); }
