// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { signAccess, signRefresh, USE_BEARER_IN_DEV } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();

  // Find active user (email normalized)
  const user = await User.findOne({ email: String(email).toLowerCase().trim(), isActive: true }).lean();
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Compare against "passwordHash" (bcrypt hash)
  const ok = await bcrypt.compare(password, (user as any).passwordHash || '');
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // JWT payload
  const payload = {
    sub: String((user as any)._id),
    email: (user as any).email,
    role: (user as any).role,
    clientId: (user as any).clientId ? String((user as any).clientId) : undefined
  };

  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Update last login (non-blocking)
  try { await User.updateOne({ _id: (user as any)._id }, { $set: { lastLoginAt: new Date() } }); } catch {}

  const res = NextResponse.json({
    user: { id: String((user as any)._id), email: (user as any).email, role: (user as any).role },
    accessToken
  });

  // In dev we pass Bearer from localStorage. If you want cookies, flip USE_BEARER_IN_DEV=false and set cookies:
  if (!USE_BEARER_IN_DEV) {
    res.cookies.set('climetz_at', accessToken, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
    res.cookies.set('climetz_rt', refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  }

  return res;
}
