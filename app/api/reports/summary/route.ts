import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Device, Sensor, SensorData, User } from '@/lib/models';
import { canSeeSensor } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { searchParams } = new URL(req.url);
  const sensorId = searchParams.get('sensorId');
  const from = new Date(searchParams.get('from') || '');
  const to = new Date(searchParams.get('to') || '');

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

  const match:any = { sensorId, ...(from && isFinite(+from) ? { timestamp:{ $gte: from } } : {}), ...(to && isFinite(+to) ? { timestamp:{ ...((from && isFinite(+from))?{ $gte: from }:{}), $lte: to } } : {}) };
  const agg = await SensorData.aggregate([
    { $match: match },
    { $project: { value: { $ifNull: ['$metrics.moisture', '$metrics.kwh'] }, } },
    { $group: { _id: null, min:{ $min:'$value' }, max:{ $max:'$value' }, count:{ $sum:1 } } }
  ]);

  const { min=null, max=null, count=0 } = agg[0] || {};
  return NextResponse.json({ min, max, count });
}
