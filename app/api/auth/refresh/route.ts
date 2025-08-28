import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccess } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();
  try {
    const t = verifyToken(refreshToken);
    if ((t as any).typ !== 'refresh') throw new Error('not refresh');
    const accessToken = signAccess({ sub:t.sub, email:t.email, role:t.role, clientId:(t as any).clientId });
    return NextResponse.json({ accessToken });
  } catch {
    return NextResponse.json({ error:'Invalid refresh' }, { status:401 });
  }
}
