// app/api/dev/seed-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// Set DISABLE_SEED=true after creating test users
const DISABLE = process.env.DISABLE_SEED === 'true';

export async function POST(req: NextRequest) {
  if (DISABLE) return NextResponse.json({ error: 'Seeding disabled' }, { status: 403 });

  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || process.env.SEED_EMAIL || 'demo@climetz.in').toLowerCase().trim();
  const passwordPlain = body.password || process.env.SEED_PASSWORD || 'climetz123';
  const role = (body.role || process.env.SEED_ROLE || 'admin') as 'user'|'admin'|'superadmin';

  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const update = {
    email,
    name: 'Climetz Demo',
    role,
    isActive: true,
    // IMPORTANT: align with Admin portal -> store bcrypt hash in "passwordHash"
    passwordHash
  };

  const user = await User.findOneAndUpdate({ email }, update, { upsert: true, new: true }).lean();
  return NextResponse.json({
    ok: true,
    user: { id: String((user as any)._id), email: (user as any).email, role: (user as any).role }
  });
}
