// /app/api/kpi/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import KpiDaily from '@/models/KpiDaily';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')!;
  const date = searchParams.get('date')!;
  const docs = await KpiDaily.find({ locationRef: location, date }).lean();
  return NextResponse.json({ items: docs });
}
