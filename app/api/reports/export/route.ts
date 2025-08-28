import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Device, Sensor, SensorData, User } from '@/lib/models';
import { canSeeSensor } from '@/lib/rbac';
import { toCsv } from '@/lib/csv';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get('sensorId');
  const from = new Date(searchParams.get('from') || '');
  const to = new Date(searchParams.get('to') || '');
  const interval = (searchParams.get('interval') || '1h') as '5m'|'1h';

  if (!sensorId) return NextResponse.json({ error:'sensorId required' }, { status:400 });

  const [user, sensor] = await Promise.all([
    (await (await import('@/lib/models')).User.findById(tok.sub).lean()),
    Sensor.findById(sensorId).lean()
  ]);
  if (!sensor || !user) return NextResponse.json({ error:'Not found' }, { status:404 });
  const device = await Device.findById(sensor.deviceId).lean();
  if (!device) return NextResponse.json({ error:'Not found' }, { status:404 });
  if (!canSeeSensor({ role:tok.role, clientId:tok.clientId, assignedLocations:user.assignedLocations }, sensor, device))
    return NextResponse.json({ error:'Forbidden' }, { status:403 });

  const match:any = { sensorId };
  if (isFinite(+from)) match.timestamp = { ...(match.timestamp||{}), $gte: from };
  if (isFinite(+to)) match.timestamp = { ...(match.timestamp||{}), $lte: to };

  const series = await SensorData.aggregate([
    { $match: match },
    { $project: { ts: '$timestamp', val: { $ifNull: ['$metrics.moisture', '$metrics.kwh'] } } },
    { $sort: { ts: 1 } },
    { $limit: 100000 }
  ]);

  const csv = toCsv(series.map(s=>({ timestamp: s.ts.toISOString(), value: s.val })));
  return new NextResponse(csv, {
    headers: {
      'Content-Type':'text/csv',
      'Content-Disposition':'attachment; filename="export.csv"'
    }
  });
}
