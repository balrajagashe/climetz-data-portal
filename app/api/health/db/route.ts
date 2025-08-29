import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import { User } from '@/lib/models';

export async function GET() {
  try {
    const conn = await dbConnect();
    const dbName = conn.connection.db.databaseName;
    const collections = await conn.connection.db.listCollections().toArray();
    const usersCount = await User.countDocuments({}).catch(()=>-1);
    return NextResponse.json({
      ok: true,
      dbName,
      collections: collections.map(c => c.name),
      usersCount
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || String(e) }, { status: 500 });
  }
}
