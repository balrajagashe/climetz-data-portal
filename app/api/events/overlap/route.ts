// /app/api/events/overlap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import EventOverlap from '@/models/EventOverlap';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')!;
  const from = new Date(String(searchParams.get('from')));
  const to   = new Date(String(searchParams.get('to')));
  const docs = await EventOverlap.find({ locationRef: location, start: { $gte: from }, end: { $lte: to } }).lean();
  return NextResponse.json({ items: docs });
}
