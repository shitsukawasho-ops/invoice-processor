import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // Upsert budget
    db.prepare(`
      INSERT INTO budgets (year, month, target_calls, target_appointments, target_contracts, fixed_cost, cpa, revenue_per_contract, target_profit_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(year, month) DO UPDATE SET
        target_calls = excluded.target_calls,
        target_appointments = excluded.target_appointments,
        target_contracts = excluded.target_contracts,
        fixed_cost = excluded.fixed_cost,
        cpa = excluded.cpa,
        revenue_per_contract = excluded.revenue_per_contract,
        target_profit_rate = excluded.target_profit_rate,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      data.year,
      data.month,
      data.target_calls,
      data.target_appointments,
      data.target_contracts,
      data.fixed_cost,
      data.cpa,
      data.revenue_per_contract,
      data.target_profit_rate
    );

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
      const budget = db.prepare('SELECT * FROM budgets WHERE year = ? AND month = ?').get(parseInt(year), parseInt(month));
      return NextResponse.json(budget);
    } else {
      const budgets = db.prepare('SELECT * FROM budgets ORDER BY year DESC, month DESC').all();
      return NextResponse.json(budgets);
    }
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
