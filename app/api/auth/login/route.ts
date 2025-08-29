// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { signAccess, signRefresh, USE_BEARER_IN_DEV } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();

  // Must match Admin: user doc has { email, password (bcrypt), role, isActive }
  const user = await User.findOne({ email, isActive: true }).lean();
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Compare against "password" (bcrypt hash)
  const ok = await bcrypt.compare(password, (user as any).password || '');
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Issue tokens
  const payload = {
    sub: String((user as any)._id),
    email: (user as any).email,
    role: (user as any).role,
    clientId: (user as any).clientId ? String((user as any).clientId) : undefined
  };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Update last login (optional)
  try { await User.updateOne({ _id: (user as any)._id }, { $set: { lastLoginAt: new Date() } }); } catch {}

  const res = NextResponse.json({
    user: { id: String((user as any)._id), email: (user as any).email, role: (user as any).role },
    accessToken
  });

  // In dev we keep Bearer; cookie mode can be enabled later if needed
  if (!USE_BEARER_IN_DEV) {
    res.cookies.set('climetz_at', accessToken, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
    res.cookies.set('climetz_rt', refreshToken, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  }

  return res;
}
