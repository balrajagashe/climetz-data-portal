// /app/api/kpi/shift/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import KpiShift from '@/models/KpiShift';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')!;
  const from = searchParams.get('from')!;
  const to = searchParams.get('to')!;
  const docs = await KpiShift.find({ locationRef: location, date: { $gte: from, $lte: to } }).lean();
  return NextResponse.json({ items: docs });
}
