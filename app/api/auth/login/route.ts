import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { signAccess, signRefresh, USE_BEARER_IN_DEV } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  const user = await User.findOne({ email, isActive:true }).lean();
  if (!user) return NextResponse.json({ error:'Invalid credentials' }, { status:401 });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return NextResponse.json({ error:'Invalid credentials' }, { status:401 });

  const payload = { sub:String(user._id), email:user.email, role:user.role, clientId: user.clientId ? String(user.clientId) : undefined };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const res = NextResponse.json({ user:{ id:String(user._id), email:user.email, role:user.role }, accessToken });
  if (!USE_BEARER_IN_DEV) {
    res.cookies.set('climetz_at', accessToken, { httpOnly:true, sameSite:'lax', secure:true, path:'/' });
    res.cookies.set('climetz_rt', refreshToken, { httpOnly:true, sameSite:'lax', secure:true, path:'/' });
  }
  return res;
}
