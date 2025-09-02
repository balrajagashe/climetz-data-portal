// /app/energy/overview/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Card from '@/components/Card';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialLocation = params.get('locationId') || '';
  const [locationId, setLocationId] = useState(initialLocation);

  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  useEffect(()=>{ if (!initialLocation && locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs, initialLocation]);

  const today = new Date().toISOString().slice(0,10);
  const { data: daily } = useSWR(token && locationId ? [`/api/kpi/daily?location=${locationId}&date=${today}`, token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  return (
    <Guard>
      <h2>Energy Overview</h2>
      <div className="row" style={{gap:12, alignItems:'center'}}>
        <span>Location</span>
        <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
          {(locs?.locations||[]).map((l:any)=><option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
      </div>

      <div className="space" />
      <div className="grid grid-3">
        <Card title="Today kWh (Total)">
          <div style={{fontSize:28}}>{sum(daily?.items, 'kwh_aseb') + sum(daily?.items, 'kwh_diesel') + sum(daily?.items, 'kwh_gas')}</div>
        </Card>
        <Card title="Diesel (L)">
          <div style={{fontSize:28}}>{sum(daily?.items, 'diesel_l')}</div>
        </Card>
        <Card title="Gas (Nm³)">
          <div style={{fontSize:28}}>{sum(daily?.items, 'gas_nm3')}</div>
        </Card>
      </div>

      <div className="space" />
      <div className="grid grid-3">
        <Card title="SFC Diesel (L/kWh)"><div style={{fontSize:28}}>{avgSfc(daily?.items, 'sfc_diesel')}</div></Card>
        <Card title="SFC Gas (Nm³/kWh)"><div style={{fontSize:28}}>{avgSfc(daily?.items, 'sfc_gas')}</div></Card>
        <Card title="Outage minutes"><div style={{fontSize:28}}>{sum(daily?.items, 'minutes_outage')}</div></Card>
      </div>
    </Guard>
  );
}

function sum(items:any[]|undefined, k:string){ return (items||[]).reduce((a,x)=>a+(x?.[k]||0),0); }
function avgSfc(items:any[]|undefined, k:string){ const arr=(items||[]).map(x=>x?.[k]||0).filter((v:number)=>v>0); return arr.length? (arr.reduce((a:number,b:number)=>a+b,0)/arr.length).toFixed(3): '0'; }
