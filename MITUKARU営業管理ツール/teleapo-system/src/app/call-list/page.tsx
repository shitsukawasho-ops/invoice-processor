import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import pool from '@/utils/db';
import CustomerListClient from './CustomerListClient';

interface Customer {
  id: number;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string | null;
  website: string | null;
  address: string | null;
  status: string;
  next_action_date: string | null;
  notes: string | null;
}

interface CallLog {
  id: number;
  customer_id: number;
  result: string;
  notes: string;
  created_at: string;
  user_name: string;
}

interface UserStats {
  today_calls: string;
  today_appointments: string;
}

export default async function CallListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userId = parseInt(session.user?.id || '0');
  const isAdmin = session.user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];

  // Get today's list
  let customers: Customer[];
  if (isAdmin) {
    const { rows } = await pool.query<Customer>(`
      SELECT c.*, u.name as assigned_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.status NOT IN ('contracted', 'ng')
      ORDER BY c.next_action_date ASC NULLS LAST, c.id ASC
    `);
    customers = rows;
  } else {
    const { rows } = await pool.query<Customer>(`
      SELECT * FROM customers 
      WHERE assigned_to = $1
      AND status NOT IN ('contracted', 'ng')
      AND (next_action_date = $2 OR next_action_date IS NULL OR status = 'new')
      ORDER BY next_action_date ASC NULLS LAST, id ASC
    `, [userId, today]);
    customers = rows;
  }

  // Get call logs for all customers
  const customerIds = customers.map(c => c.id);
  let callLogsMap: Record<number, CallLog[]> = {};

  if (customerIds.length > 0) {
    const { rows: allCallLogs } = await pool.query<CallLog>(`
      SELECT cl.*, u.name as user_name
      FROM call_logs cl
      JOIN users u ON cl.user_id = u.id
      WHERE cl.customer_id = ANY($1)
      ORDER BY cl.created_at DESC
    `, [customerIds]);

    // Group by customer_id
    allCallLogs.forEach(log => {
      if (!callLogsMap[log.customer_id]) {
        callLogsMap[log.customer_id] = [];
      }
      callLogsMap[log.customer_id].push(log);
    });
  }

  // Get today's stats
  const { rows: statsResult } = await pool.query<UserStats>(`
    SELECT 
      COUNT(*)::text as today_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END)::text as today_appointments
    FROM call_logs
    WHERE user_id = $1 AND DATE(created_at) = $2
  `, [userId, today]);
  const stats = statsResult[0] || { today_calls: '0', today_appointments: '0' };

  const statusLabels: Record<string, string> = {
    new: '未着手',
    unreachable: '不通',
    recall: '再架電',
    callback: '折り返し待ち',
    appointed: 'アポ獲得',
    ng: 'NG',
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">架電リスト</h1>
        <p className="page-subtitle">{isAdmin ? '全顧客リスト' : '本日の架電対象'}</p>
      </div>

      {/* Today's Progress */}
      {!isAdmin && (
        <div className="today-progress">
          <div className="today-progress-title">本日の実績</div>
          <div className="today-progress-stats">
            <div className="today-stat">
              <div className="today-stat-value">{parseInt(stats.today_calls) || 0}</div>
              <div className="today-stat-label">架電数</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{parseInt(stats.today_appointments) || 0}</div>
              <div className="today-stat-label">アポ獲得</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{customers.length}</div>
              <div className="today-stat-label">残り件数</div>
            </div>
          </div>
        </div>
      )}

      {/* Customer List with Search and Filter */}
      <CustomerListClient
        customers={customers}
        statusLabels={statusLabels}
        callLogsMap={callLogsMap}
      />
    </Layout>
  );
}


