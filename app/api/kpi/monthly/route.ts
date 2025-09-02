// /app/api/kpi/monthly/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import KpiMonthly from '@/models/KpiMonthly';

export async function GET(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')!;
  const month = searchParams.get('month')!;
  const doc = await KpiMonthly.findOne({ locationRef: location, yearMonth: month }).lean();
  return NextResponse.json({ item: doc });
}
