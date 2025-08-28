import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Device, Sensor, User, Location } from '@/lib/models';
import { canSeeDevice } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');
  if (!deviceId) return NextResponse.json({ error:'deviceId required' }, { status:400 });

  const user = await User.findById(tok.sub).lean();
  const dev = await Device.findById(deviceId).lean();
  if (!user || !dev) return NextResponse.json({ error:'Not found' }, { status:404 });

  if (!canSeeDevice({ role:tok.role, clientId:tok.clientId, assignedLocations:user.assignedLocations }, dev))
    return NextResponse.json({ error:'Forbidden' }, { status:403 });

  const sensors = await Sensor.find({ deviceId, isActive:true }).lean();
  return NextResponse.json({ sensors: sensors.map(s=>({ ...s, _id:String(s._id) })) });
}
