// /app/import/page.tsx
'use client';
import Guard from '@/components/Guard';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

type Loc = { _id:string, name:string };
type Dev = { _id:string, name:string, type:string };

const PRESETS = [
  { key:'ASEB_T1_T2', label:'ASEB Transformer (Energy Meter)' },
  { key:'DG_ENERGY',  label:'DG Energy Meter (380/500 kVA)' },
  { key:'DG_FUEL',    label:'DG Fuel Sensor (Flow Totalizer)' },
];

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState('DG_ENERGY');
  const [locationId, setLocationId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const { data: locs } = useSWR(token ? ['/api/locations/assigned', token] : null, ([url,t]) => fetch(url, { headers:{ Authorization:`Bearer ${t}` } }).then(r=>r.json()));
  const { data: devs } = useSWR(token && locationId ? [`/api/devices/by-location?locationId=${locationId}`, token] : null, ([url,t]) => fetch(url, { headers:{ Authorization:`Bearer ${t}` } }).then(r=>r.json()));

  useEffect(()=>{ if (locs?.locations?.[0]?._id) setLocationId(locs.locations[0]._id); }, [locs]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const arr = Array.from(e.dataTransfer.files || []);
    setFiles(f => [...f, ...arr]);
  };
  const onSubmit = async () => {
    if (!files.length || !locationId || !deviceId) return alert('Select files, location and device');
    const fd = new FormData();
    files.forEach(f => fd.append('files', f, f.name));
    fd.append('preset', preset);
    fd.append('locationId', locationId);
    fd.append('deviceId', deviceId);
    const res = await fetch('/api/import', { method:'POST', body: fd, headers:{ Authorization:`Bearer ${token}` }});
    const js = await res.json();
    if (!res.ok) return alert(js.error || 'Import failed');
    alert(`Imported: ok=${js.rowsOk}, dup=${js.rowsDup}, bad=${js.rowsBad}`);
  };

  return (
    <Guard>
      <h2>CSV Import</h2>
      <div className="space" />
      <div className="grid grid-3">
        <div className="card">
          <strong>1) Choose preset</strong>
          <select className="input" value={preset} onChange={e=>setPreset(e.target.value)}>
            {PRESETS.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div className="card">
          <strong>2) Location & Device</strong>
          <select className="input" value={locationId} onChange={e=>{ setLocationId(e.target.value); setDeviceId(''); }}>
            <option value="">Select location</option>
            {(locs?.locations||[]).map((l:Loc)=><option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <select className="input" value={deviceId} onChange={e=>setDeviceId(e.target.value)}>
            <option value="">Select device</option>
            {(devs?.devices||[]).map((d:Dev)=><option key={d._id} value={d._id}>{d.name} ({d.type})</option>)}
          </select>
        </div>
        <div className="card">
          <strong>3) Files</strong>
          <div onDragOver={e=>e.preventDefault()} onDrop={onDrop} style={{border:'1px dashed #888', padding:16, borderRadius:8, minHeight:90}}>
            Drop CSVs here or use file picker
            <input className="input" type="file" multiple accept=".csv,text/csv" onChange={e=>setFiles(Array.from(e.target.files||[]))}/>
          </div>
          <div style={{fontSize:12, opacity:.8}}>
            Auto-detects delimiter; assumes IST timestamps or converts if ISO.
          </div>
        </div>
      </div>

      <div className="space" />
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}>
          <strong>Selected files</strong>
          <button className="btn" onClick={()=>setFiles([])}>Clear</button>
        </div>
        <ul style={{marginTop:8}}>
          {files.map((f,i)=><li key={i}>{f.name}</li>)}
        </ul>
      </div>

      <div className="space" />
      <button className="btn" onClick={onSubmit}>Import</button>
    </Guard>
  );
}
