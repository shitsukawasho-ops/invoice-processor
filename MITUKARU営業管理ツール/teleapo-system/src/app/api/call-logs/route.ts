import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

// Slack notification helper
async function sendSlackNotification(params: {
  userName: string;
  companyName: string;
  companyUrl?: string | null;
}): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL is not configured');
    return false;
  }

  const { userName, companyName, companyUrl } = params;

  // Format message same as GAS script
  let text: string;
  if (companyUrl && companyUrl.trim()) {
    text = `<!channel>\n:fire:新規アポ獲得情報:fire:\n${userName}さんが「<${companyUrl}|${companyName}>」のアポを獲得しました！`;
  } else {
    text = `<!channel>\n:fire:新規アポ獲得情報:fire:\n${userName}さんが「${companyName}」のアポを獲得しました！`;
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
      return false;
    }

    console.log('Slack notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { customerId, result, notes, nextActionDate } = await request.json();
    const userId = parseInt(session.user?.id || '0');

    // Insert call log
    await pool.query(`
      INSERT INTO call_logs (customer_id, user_id, result, notes, next_action_date)
      VALUES ($1, $2, $3, $4, $5)
    `, [customerId, userId, result, notes, nextActionDate]);

    // Update customer status based on result
    let newStatus = 'calling';
    if (result === 'appointed') {
      newStatus = 'appointed';
    } else if (result === 'ng') {
      newStatus = 'ng';
    } else if (result === 'unreachable') {
      newStatus = 'unreachable';
    }

    await pool.query(`
      UPDATE customers 
      SET status = $1, next_action_date = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [newStatus, nextActionDate, customerId]);

    // Log audit
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, table_name, record_id, new_value)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, 'CREATE', 'call_logs', customerId, JSON.stringify({ result, notes })]);

    // Send Slack notification for appointments
    if (result === 'appointed') {
      // Get customer and user info for notification
      const { rows } = await pool.query<{ company_name: string; website: string | null }>(`SELECT company_name, website FROM customers WHERE id = $1`, [customerId]);
      const customer = rows[0];
      const userName = session.user?.name || 'Unknown';

      if (customer) {
        // Fire and forget - don't wait for Slack response
        sendSlackNotification({
          userName,
          companyName: customer.company_name,
          companyUrl: customer.website,
        }).catch(err => console.error('Slack notification error:', err));
      }
    }

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
      const { rows } = await pool.query(`
        SELECT cl.*, u.name as user_name
        FROM call_logs cl
        JOIN users u ON cl.user_id = u.id
        WHERE cl.customer_id = $1
        ORDER BY cl.created_at DESC
      `, [parseInt(customerId)]);
      logs = rows;
    } else {
      const { rows } = await pool.query(`
        SELECT cl.*, u.name as user_name, c.company_name
        FROM call_logs cl
        JOIN users u ON cl.user_id = u.id
        JOIN customers c ON cl.customer_id = c.id
        ORDER BY cl.created_at DESC
        LIMIT 100
      `);
      logs = rows;
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

