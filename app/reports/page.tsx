'use client';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Guard from '@/components/Guard';
import DateRange from '@/components/DateRange';
import TimeSeriesChart from '@/components/TimeSeriesChart';

export default function Page() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialSensorId = params.get('sensorId') || '';
  const [sensorId,setSensorId] = useState(initialSensorId);
  const [range,setRange] = useState<{from:string,to:string}>(()=> {
    const d = new Date(); const to = d.toISOString().slice(0,10);
    d.setDate(d.getDate()-7); const from = d.toISOString().slice(0,10);
    return {from,to};
  });
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';

  const q = useMemo(()=> sensorId ? `/api/reports/timeseries?sensorId=${sensorId}&from=${range.from}&to=${range.to}&interval=1h` : '', [sensorId,range]);
  const { data:ts } = useSWR(token && q ? [q, token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));
  const { data:summary } = useSWR(token && sensorId ? [`/api/reports/summary?sensorId=${sensorId}&from=${range.from}&to=${range.to}`, token] : null, ([url,t]) => fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()));

  async function exportCsv() {
    const url = `/api/reports/export?sensorId=${sensorId}&from=${range.from}&to=${range.to}&interval=1h`;
    const res = await fetch(url, { headers:{ Authorization:`Bearer ${token}` }});
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `export_${sensorId || 'sensor'}_${range.from}_${range.to}.csv`;
    a.click();
  }

  return (
    <Guard>
      <h2>Reports</h2>
      <div className="space" />
      <div className="card">
        <div className="grid" style={{gap:12}}>
          <input className="input" placeholder="Sensor ID" value={sensorId} onChange={e=>setSensorId(e.target.value)} />
          <DateRange value={range} onChange={setRange}/>
          <div className="row">
            <button className="btn" onClick={exportCsv} disabled={!sensorId}>Export CSV</button>
          </div>
        </div>
      </div>
      <div className="space" />
      {summary && (
        <div className="grid grid-3">
          <div className="card"><strong>Samples</strong><div style={{fontSize:28}}>{summary.count}</div></div>
          <div className="card"><strong>Min</strong><div style={{fontSize:28}}>{summary.min ?? '-'}</div></div>
          <div className="card"><strong>Max</strong><div style={{fontSize:28}}>{summary.max ?? '-'}</div></div>
        </div>
      )}
      <div className="space" />
      {ts?.series && <TimeSeriesChart series={ts.series} />}
    </Guard>
  );
}
