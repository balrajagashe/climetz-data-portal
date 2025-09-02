// /app/energy/config/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const [locationId, setLocationId] = useState('');
  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  useEffect(()=>{ if (locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs]);

  // simple forms
  const [shifts, setShifts] = useState([{name:'A',start:'06:00',end:'14:00'},{name:'B',start:'14:00',end:'22:00'},{name:'C',start:'22:00',end:'06:00'}]);
  const [cost, setCost] = useState({ grid_rate_per_kwh:8, contract_demand_kva:0, fixed_per_kva_month:0, demand_per_kva_month:0, grid_tax_pct:0, diesel_rate_per_l:90, diesel_tax_pct:0, gas_rate_per_nm3:47, gas_tax_pct:0 });
  const [th, setTh] = useState({ min_run_minutes:10, min_outage_minutes:5, use_kw_logic:false });
  const [deviceId, setDeviceId] = useState('');
  const [gasSfc, setGasSfc] = useState(0.27);

  const { data: devs } = useSWR(token && locationId ? [`/api/devices/by-location?locationId=${locationId}`, token] : null, ([u,t])=>fetch(u,{headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  const put = (url:string, body:any) => fetch(url, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(body) }).then(r=>r.json());

  const saveShifts = async () => {
    if (!locationId) return;
    await put('/api/config/shift', { locationRef: locationId, effective_from: new Date(), shifts });
    alert('Shifts saved (new version)');
  };
  const saveCosts = async () => {
    if (!locationId) return;
    await put('/api/config/cost', { locationRef: locationId, effective_from: new Date(), ...cost });
    alert('Costs saved (new version)');
  };
  const saveThresholds = async () => {
    if (!locationId) return;
    await put('/api/config/thresholds', { locationRef: locationId, effective_from: new Date(), ...th });
    alert('Thresholds saved (new version)');
  };
  const saveGasSfc = async () => {
    if (!deviceId) return alert('Pick a gas device');
    await put('/api/config/gas-sfc', { deviceId, gas_nm3_per_kwh: gasSfc });
    alert('Gas SFC saved per device');
  };

  return (
    <Guard>
      <h2>Energy Config</h2>
      <div className="row" style={{gap:12}}>
        <select className="input" value={locationId} onChange={e=>setLocationId(e.target.value)}>
          {(locs?.locations||[]).map((l:any)=><option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
      </div>

      <div className="space" />
      <div className="grid grid-2">
        <div className="card">
          <strong>Shifts</strong>
          {shifts.map((s,i)=>(
            <div key={i} className="row" style={{gap:8, marginTop:8}}>
              <input className="input" style={{width:60}} value={s.name} onChange={e=>edit(i,'name',e.target.value)}/>
              <input className="input" style={{width:100}} value={s.start} onChange={e=>edit(i,'start',e.target.value)}/>
              <input className="input" style={{width:100}} value={s.end} onChange={e=>edit(i,'end',e.target.value)}/>
            </div>
          ))}
          <div className="space" />
          <button className="btn" onClick={saveShifts}>Save (new version)</button>
        </div>

        <div className="card">
          <strong>Tariffs & Fuel</strong>
          {Object.entries(cost).map(([k,v])=>(
            <div key={k} className="row" style={{gap:8, marginTop:8}}>
              <label style={{width:220}}>{k}</label>
              <input className="input" style={{width:140}} type="number" value={v as number} onChange={e=>setCost({...cost, [k]: Number(e.target.value)})}/>
            </div>
          ))}
          <div className="space" />
          <button className="btn" onClick={saveCosts}>Save (new version)</button>
        </div>

        <div className="card">
          <strong>Thresholds</strong>
          <div className="row" style={{gap:8, marginTop:8}}>
            <label style={{width:220}}>min_run_minutes</label>
            <input className="input" type="number" value={th.min_run_minutes} onChange={e=>setTh({...th, min_run_minutes:Number(e.target.value)})}/>
          </div>
          <div className="row" style={{gap:8, marginTop:8}}>
            <label style={{width:220}}>min_outage_minutes</label>
            <input className="input" type="number" value={th.min_outage_minutes} onChange={e=>setTh({...th, min_outage_minutes:Number(e.target.value)})}/>
          </div>
          <div className="row" style={{gap:8, marginTop:8}}>
            <label style={{width:220}}>use_kw_logic</label>
            <input type="checkbox" checked={th.use_kw_logic} onChange={e=>setTh({...th, use_kw_logic:e.target.checked})}/>
          </div>
          <div className="space" />
          <button className="btn" onClick={saveThresholds}>Save (new version)</button>
        </div>

        <div className="card">
          <strong>Gas SFC (per gas device)</strong>
          <select className="input" value={deviceId} onChange={e=>setDeviceId(e.target.value)}>
            <option value="">Select gas genset device</option>
            {(devs?.devices||[]).filter((d:any)=>d.type==='DG_GAS').map((d:any)=><option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <div className="row" style={{gap:8, marginTop:8}}>
            <label>gas_nm3_per_kwh</label>
            <input className="input" type="number" step="0.01" value={gasSfc} onChange={e=>setGasSfc(Number(e.target.value))}/>
          </div>
          <div className="space" />
          <button className="btn" onClick={saveGasSfc}>Save SFC</button>
        </div>
      </div>
    </Guard>
  );

  function edit(i:number, k:'name'|'start'|'end', v:string){
    const cp = [...shifts]; (cp as any)[i][k] = v; setShifts(cp);
  }
}
