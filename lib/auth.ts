import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('JWT_SECRET missing');

// Toggle this: dev on Replit uses Authorization header, prod can use cookies
export const USE_BEARER_IN_DEV = true;

type TokenPayload = { sub: string, email: string, role: 'user'|'admin'|'superadmin', clientId?: string };

export function signAccess(payload: TokenPayload, expiresIn = '15m') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
export function signRefresh(payload: TokenPayload, expiresIn = '7d') {
  return jwt.sign({ ...payload, typ:'refresh' }, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as TokenPayload & { exp:number, iat:number, typ?:string };
}

export function getAuthFromRequest(req: NextRequest): TokenPayload | null {
  try {
    if (USE_BEARER_IN_DEV) {
      const auth = req.headers.get('authorization');
      if (auth?.startsWith('Bearer ')) return verifyToken(auth.slice(7));
    } else {
      const c = req.cookies.get('climetz_at')?.value;
      if (c) return verifyToken(c);
    }
  } catch {}
  return null;
}
