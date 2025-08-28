import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const tok = getAuthFromRequest(req);
  if (!tok) return NextResponse.json({ ok:false }, { status:401 });
  return NextResponse.json({ ok:true, user: tok });
}
