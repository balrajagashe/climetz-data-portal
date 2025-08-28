'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Guard from '@/components/Guard';
import Link from 'next/link';
import Card from '@/components/Card';

export default function Page() {
  const { locationId } = useParams<{locationId:string}>();
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const { data } = useSWR(token ? [`/api/devices/by-location?locationId=${locationId}`, token] : null, ([url,t]) =>
    fetch(url, { headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json())
  );

  return (
    <Guard>
      <h2>Devices</h2>
      <div className="grid grid-3">
        {(data?.devices || []).map((d:any)=>(
          <Card key={d._id} title={d.name} subtitle={d.type || 'Device'}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="badge">{d.code || d.imei || '-'}</span>
              <Link className="btn" href={`/devices/${d._id}`}>Sensors</Link>
            </div>
          </Card>
        ))}
      </div>
    </Guard>
  );
}
