// /app/api/config/thresholds/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import ThresholdConfig from '@/models/ThresholdConfig';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location')!;
  const at = new Date(searchParams.get('at') || Date.now());
  const doc = await ThresholdConfig.findOne({ locationRef: location, effective_from: { $lte: at } }).sort({ effective_from: -1 }).lean();
  return NextResponse.json({ item: doc });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok || (tok.role !== 'admin' && tok.role !== 'superadmin')) return NextResponse.json({ error:'Forbidden' }, { status:403 });
  const body = await req.json();
  const doc = await ThresholdConfig.create(body);
  return NextResponse.json({ ok:true, id:String(doc._id) });
}
