// /app/energy/costs/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Card from '@/components/Card';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const [locationId, setLocationId] = useState('');
  const ym = new Date().toISOString().slice(0,7);
  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  useEffect(()=>{ if (locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs]);
  const { data } = useSWR(token && locationId ? [`/api/kpi/monthly?location=${locationId}&month=${ym}`, token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  const m = data?.item || {};
  return (
    <Guard>
      <h2>Costs</h2>
      <div className="row" style={{gap:12}}>
        <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
          {(locs?.locations||[]).map((l:any)=><option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
        <div className="badge">Month: {ym}</div>
      </div>
      <div className="space" />
      <div className="grid grid-4">
        <Card title="Total"><div style={{fontSize:28}}>₹ {fmt(m.cost_total)}</div></Card>
        <Card title="Grid"><div style={{fontSize:28}}>₹ {fmt(m.cost_grid)}</div></Card>
        <Card title="Diesel"><div style={{fontSize:28}}>₹ {fmt(m.cost_diesel)}</div></Card>
        <Card title="Gas"><div style={{fontSize:28}}>₹ {fmt(m.cost_gas)}</div></Card>
      </div>
    </Guard>
  );
}
function fmt(n:number){ return (n||0).toFixed(0); }
