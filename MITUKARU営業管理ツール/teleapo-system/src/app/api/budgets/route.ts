import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();

    // Upsert budget
    await pool.query(`
      INSERT INTO budgets (year, month, target_calls, target_appointments, target_contracts, fixed_cost, cpa, revenue_per_contract, target_profit_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT(year, month) DO UPDATE SET
        target_calls = EXCLUDED.target_calls,
        target_appointments = EXCLUDED.target_appointments,
        target_contracts = EXCLUDED.target_contracts,
        fixed_cost = EXCLUDED.fixed_cost,
        cpa = EXCLUDED.cpa,
        revenue_per_contract = EXCLUDED.revenue_per_contract,
        target_profit_rate = EXCLUDED.target_profit_rate,
        updated_at = CURRENT_TIMESTAMP
    `, [
      data.year,
      data.month,
      data.target_calls,
      data.target_appointments,
      data.target_contracts,
      data.fixed_cost,
      data.cpa,
      data.revenue_per_contract,
      data.target_profit_rate
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving budget:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    if (year && month) {
      const { rows } = await pool.query('SELECT * FROM budgets WHERE year = $1 AND month = $2', [parseInt(year), parseInt(month)]);
      return NextResponse.json(rows[0]);
    } else {
      const { rows } = await pool.query('SELECT * FROM budgets ORDER BY year DESC, month DESC');
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
