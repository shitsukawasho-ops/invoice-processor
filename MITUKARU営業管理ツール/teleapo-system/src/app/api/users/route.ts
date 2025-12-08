import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import bcrypt from 'bcryptjs';
import pool from '@/utils/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { email, name, password, role, daily_quota } = await request.json();
    const passwordHash = bcrypt.hashSync(password, 10);

    const { rows } = await pool.query(`
      INSERT INTO users (email, name, password_hash, role, daily_quota)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, daily_quota, created_at
    `, [email, name, passwordHash, role, daily_quota || 50]);

    const newUser = rows[0];

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { rows: users } = await pool.query('SELECT id, email, name, role, daily_quota, created_at FROM users ORDER BY id ASC');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
