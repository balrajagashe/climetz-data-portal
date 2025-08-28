'use client';
import useSWR from 'swr';
import Guard from '@/components/Guard';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Page() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('climetz_at') || '' : '';
  const { data, error, isLoading } = useSWR(token ? ['/api/locations/assigned', token] : null, ([url,t]) =>
    fetch(url, { headers:{ Authorization:`Bearer ${t}` } }).then(r=>r.json())
  );

  return (
    <Guard>
      <h2>Assigned Locations</h2>
      <div className="space" />
      {isLoading && <div className="card">Loading...</div>}
      {error && <div className="card">Failed to load</div>}
      <div className="grid grid-3">
        {(data?.locations || []).map((loc:any)=>(
          <Card key={loc._id} title={loc.name} subtitle={loc.code || 'Location'}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <span className="badge">Client: {loc.client?.name || '-'}</span>
              <Link className="btn" href={`/locations/${loc._id}`}>View devices</Link>
            </div>
          </Card>
        ))}
      </div>
    </Guard>
  );
}
