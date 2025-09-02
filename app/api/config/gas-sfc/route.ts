// /app/api/config/gas-sfc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { Device } from '@/lib/models';

export async function PUT(req: NextRequest) {
  await dbConnect();
  const tok = getAuthFromRequest(req);
  if (!tok || (tok.role !== 'admin' && tok.role !== 'superadmin')) return NextResponse.json({ error:'Forbidden' }, { status:403 });
  const { deviceId, gas_nm3_per_kwh } = await req.json();
  if (!deviceId) return NextResponse.json({ error:'deviceId required' }, { status:400 });
  await Device.updateOne({ _id: deviceId }, { $set: { gas_nm3_per_kwh } });
  return NextResponse.json({ ok:true });
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId')!;
  const d = await Device.findById(deviceId).lean();
  return NextResponse.json({ gas_nm3_per_kwh: d?.gas_nm3_per_kwh ?? 0.27 });
}
