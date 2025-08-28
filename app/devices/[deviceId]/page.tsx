'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Guard from '@/components/Guard';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Page() {
  const { deviceId } = useParams<{deviceId:string}>();
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const { data } = useSWR(token ? [`/api/sensors/by-device?deviceId=${deviceId}`, token] : null, ([url,t]) =>
    fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json())
  );

  return (
    <Guard>
      <h2>Sensors</h2>
      <div className="grid grid-3">
        {(data?.sensors || []).map((s:any)=>(
          <Card key={s._id} title={`${s.type} ${s.depth ? `(${s.depth}cm)` : ''}`} subtitle={s.unit || 'Sensor'}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="badge">{s._id}</span>
              <Link className="btn" href={`/reports?sensorId=${s._id}`}>View report</Link>
            </div>
          </Card>
        ))}
      </div>
    </Guard>
  );
}
