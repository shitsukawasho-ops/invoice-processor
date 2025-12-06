import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { customerId, result, notes, nextActionDate } = await request.json();
    const userId = parseInt(session.user?.id || '0');

    // Insert call log
    const insertLog = db.prepare(`
      INSERT INTO call_logs (customer_id, user_id, result, notes, next_action_date)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertLog.run(customerId, userId, result, notes, nextActionDate);

    // Update customer status based on result
    let newStatus = 'calling';
    if (result === 'appointed') {
      newStatus = 'appointed';
    } else if (result === 'ng') {
      newStatus = 'ng';
    } else if (result === 'unreachable') {
      newStatus = 'unreachable';
    }

    const updateCustomer = db.prepare(`
      UPDATE customers 
      SET status = ?, next_action_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateCustomer.run(newStatus, nextActionDate, customerId);

    // Log audit
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_value)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertAudit.run(userId, 'CREATE', 'call_logs', customerId, JSON.stringify({ result, notes }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating call log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  try {
    let logs;
    if (customerId) {
      logs = db.prepare(`
        SELECT cl.*, u.name as user_name
        FROM call_logs cl
        JOIN users u ON cl.user_id = u.id
        WHERE cl.customer_id = ?
        ORDER BY cl.created_at DESC
      `).all(parseInt(customerId));
    } else {
      logs = db.prepare(`
        SELECT cl.*, u.name as user_name, c.company_name
        FROM call_logs cl
        JOIN users u ON cl.user_id = u.id
        JOIN customers c ON cl.customer_id = c.id
        ORDER BY cl.created_at DESC
        LIMIT 100
      `).all();
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
