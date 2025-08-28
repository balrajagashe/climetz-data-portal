import { NextResponse } from 'next/server';
import { USE_BEARER_IN_DEV } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok:true });
  if (!USE_BEARER_IN_DEV) {
    res.cookies.set('climetz_at','',{httpOnly:true,expires:new Date(0),path:'/'});
    res.cookies.set('climetz_rt','',{httpOnly:true,expires:new Date(0),path:'/'});
  }
  return res;
}
