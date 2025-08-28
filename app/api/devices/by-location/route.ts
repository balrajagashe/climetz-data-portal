import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Device, Location, User } from '@/lib/models';
import { canSeeLocation } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get('locationId');
  if (!locationId) return NextResponse.json({ error:'locationId required' }, { status:400 });

  const [user, loc] = await Promise.all([
    // minimal user
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    (await (await import('@/lib/models')).User.findById(tok.sub).lean()),
    Location.findById(locationId).lean()
  ]);
  if (!loc || !user || !canSeeLocation({ role:tok.role, clientId:tok.clientId, assignedLocations:user.assignedLocations }, loc))
    return NextResponse.json({ error:'Forbidden' }, { status:403 });

  const devices = await Device.find({ locationId, isActive:true }).lean();
  return NextResponse.json({ devices: devices.map(d=>({ ...d, _id:String(d._id) })) });
}
