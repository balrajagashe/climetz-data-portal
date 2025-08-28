import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Location, Client, User } from '@/lib/models';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  let q:any = { isActive:true };
  if (tok.role === 'user') {
    const u = await User.findById(tok.sub).lean();
    q._id = { $in: (u?.assignedLocations || []) };
  }
  if (tok.role === 'admin') q.clientId = tok.clientId;

  const locations = await Location.find(q).lean();
  const clientIds = [...new Set(locations.map((l:any)=>String(l.clientId)))];
  const clients = await Client.find({ _id:{ $in:clientIds } }).lean();
  const byId = Object.fromEntries(clients.map((c:any)=>[String(c._id), c]));
  const out = locations.map((l:any)=>({ ...l, _id:String(l._id), client: byId[String(l.clientId)] || null }));
  return NextResponse.json({ locations: out });
}
