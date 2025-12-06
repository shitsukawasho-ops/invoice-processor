import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/components/Layout';
import db from '@/lib/db';
import CustomerCard from './CustomerCard';

interface Customer {
  id: number;
  company_name: string;
  contact_name: string;
  phone: string;
  status: string;
  next_action_date: string | null;
}

interface UserStats {
  today_calls: number;
  today_appointments: number;
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
    customers = db.prepare(`
      SELECT c.*, u.name as assigned_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.status NOT IN ('contracted', 'ng')
      ORDER BY c.next_action_date ASC, c.id ASC
    `).all() as Customer[];
  } else {
    customers = db.prepare(`
      SELECT * FROM customers 
      WHERE assigned_to = ? 
      AND status NOT IN ('contracted', 'ng')
      AND (next_action_date = ? OR next_action_date IS NULL OR status = 'new')
      ORDER BY next_action_date ASC NULLS LAST, id ASC
    `).all(userId, today) as Customer[];
  }

  // Get today's stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as today_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END) as today_appointments
    FROM call_logs
    WHERE user_id = ? AND DATE(created_at) = ?
  `).get(userId, today) as UserStats;

  const statusLabels: Record<string, string> = {
    new: '未着手',
    calling: '架電中',
    appointed: 'アポ獲得',
    contracted: '成約',
    ng: 'NG',
    unreachable: '不通',
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
              <div className="today-stat-value">{stats.today_calls || 0}</div>
              <div className="today-stat-label">架電数</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{stats.today_appointments || 0}</div>
              <div className="today-stat-label">アポ獲得</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{customers.length}</div>
              <div className="today-stat-label">残り件数</div>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {customers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-text-light)' }}>本日の架電対象はありません</p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              statusLabels={statusLabels}
            />
          ))
        )}
      </div>
    </Layout>
  );
}
