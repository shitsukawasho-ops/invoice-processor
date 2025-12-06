import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/components/Layout';
import db from '@/lib/db';
import { TrendingUp, TrendingDown, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { ssr: false });

interface Budget {
  target_calls: number;
  target_appointments: number;
  target_contracts: number;
  fixed_cost: number;
  cpa: number;
  revenue_per_contract: number;
  target_profit_rate: number;
}

interface CallStats {
  total_calls: number;
  appointments: number;
  contracts: number;
}

interface UserStats {
  user_calls: number;
  user_appointments: number;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user?.role === 'admin';
  const userId = parseInt(session.user?.id || '0');

  // Get current month stats
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const today = now.toISOString().split('T')[0];

  // Get budget settings
  const budget = db.prepare(`
    SELECT * FROM budgets WHERE year = ? AND month = ?
  `).get(year, month) as Budget | undefined;

  // Get monthly call stats
  const monthStats = db.prepare(`
    SELECT 
      COUNT(*) as total_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END) as appointments,
      (SELECT COUNT(*) FROM customers WHERE status = 'contracted' AND updated_at >= ?) as contracts
    FROM call_logs
    WHERE created_at >= ?
  `).get(startOfMonth, startOfMonth) as CallStats;

  // Get user-specific stats
  const userStats = db.prepare(`
    SELECT 
      COUNT(*) as user_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END) as user_appointments
    FROM call_logs
    WHERE user_id = ? AND DATE(created_at) = ?
  `).get(userId, today) as UserStats;

  // Get today's list count for user
  const todayListCount = db.prepare(`
    SELECT COUNT(*) as count FROM customers 
    WHERE assigned_to = ? 
    AND (next_action_date = ? OR (next_action_date IS NULL AND status = 'new'))
  `).get(userId, today) as { count: number };

  const targetCalls = budget?.target_calls || 500;
  const targetAppointments = budget?.target_appointments || 50;
  const targetContracts = budget?.target_contracts || 10;

  const callProgress = Math.round((monthStats.total_calls / targetCalls) * 100);
  const appointmentProgress = Math.round((monthStats.appointments / targetAppointments) * 100);
  const contractProgress = Math.round((monthStats.contracts / targetContracts) * 100);

  // PL calculations
  const revenue = monthStats.contracts * (budget?.revenue_per_contract || 500000);
  const variableCost = monthStats.total_calls * (budget?.cpa || 5000);
  const totalCost = (budget?.fixed_cost || 1000000) + variableCost;
  const profit = revenue - totalCost;
  const profitRate = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  // Get daily stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  const dailyData = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END) as appointments
    FROM call_logs
    WHERE created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(thirtyDaysAgoStr) as { date: string; calls: number; appointments: number }[];

  // Fill in missing dates
  const dailyStats = [];
  // Create a new date object to avoid modifying thirtyDaysAgo
  const currentDate = new Date(thirtyDaysAgo);
  // Reset time to avoid infinite loops or comparison issues
  currentDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const found = dailyData.find(item => item.date === dateStr);
    dailyStats.push({
      date: dateStr,
      calls: found?.calls || 0,
      appointments: found?.appointments || 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get result distribution
  const resultData = db.prepare(`
    SELECT result, COUNT(*) as count
    FROM call_logs
    WHERE created_at >= ?
    GROUP BY result
  `).all(startOfMonth) as { result: string; count: number }[];

  const resultLabelMap: Record<string, string> = {
    appointed: 'アポイント',
    completed: '完了',
    no_answer: '不通',
    callback: '掛け直し',
    rejected: 'NG',
    error: 'エラー'
  };

  const resultStats = resultData.map(item => ({
    name: resultLabelMap[item.result] || item.result,
    value: item.count
  })).sort((a, b) => b.value - a.value);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">ダッシュボード</h1>
        <p className="page-subtitle">{year}年{month}月の実績</p>
      </div>

      {/* Today's Progress for Users */}
      {!isAdmin && (
        <div className="today-progress">
          <div className="today-progress-title">本日の進捗</div>
          <div className="today-progress-stats">
            <div className="today-stat">
              <div className="today-stat-value">{userStats.user_calls || 0}</div>
              <div className="today-stat-label">架電数</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{userStats.user_appointments || 0}</div>
              <div className="today-stat-label">アポ獲得</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-value">{todayListCount.count}</div>
              <div className="today-stat-label">残りリスト</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly KPIs */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Phone size={20} style={{ color: 'var(--color-primary)' }} />
            <span className="card-title" style={{ marginBottom: 0 }}>架電数</span>
          </div>
          <div className="card-value">{monthStats.total_calls}</div>
          <div className="progress" style={{ marginTop: '0.75rem' }}>
            <div
              className={`progress-bar ${callProgress >= 100 ? 'success' : callProgress >= 50 ? '' : 'warning'}`}
              style={{ width: `${Math.min(callProgress, 100)}%` }}
            />
          </div>
          <div className="card-change" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>目標: {targetCalls}</span>
            <span>{callProgress}%</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--color-secondary)' }} />
            <span className="card-title" style={{ marginBottom: 0 }}>アポ数</span>
          </div>
          <div className="card-value">{monthStats.appointments}</div>
          <div className="progress" style={{ marginTop: '0.75rem' }}>
            <div
              className={`progress-bar ${appointmentProgress >= 100 ? 'success' : appointmentProgress >= 50 ? '' : 'warning'}`}
              style={{ width: `${Math.min(appointmentProgress, 100)}%` }}
            />
          </div>
          <div className="card-change" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>目標: {targetAppointments}</span>
            <span>{appointmentProgress}%</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-primary-dark)' }} />
            <span className="card-title" style={{ marginBottom: 0 }}>成約数</span>
          </div>
          <div className="card-value">{monthStats.contracts}</div>
          <div className="progress" style={{ marginTop: '0.75rem' }}>
            <div
              className={`progress-bar ${contractProgress >= 100 ? 'success' : contractProgress >= 50 ? '' : 'warning'}`}
              style={{ width: `${Math.min(contractProgress, 100)}%` }}
            />
          </div>
          <div className="card-change" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>目標: {targetContracts}</span>
            <span>{contractProgress}%</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <XCircle size={20} style={{ color: 'var(--color-warning)' }} />
            <span className="card-title" style={{ marginBottom: 0 }}>アポ率</span>
          </div>
          <div className="card-value">
            {monthStats.total_calls > 0
              ? Math.round((monthStats.appointments / monthStats.total_calls) * 100)
              : 0}%
          </div>
          <div className="card-change" style={{ marginTop: '0.75rem' }}>
            CPA: ¥{monthStats.appointments > 0 ? Math.round(variableCost / monthStats.appointments).toLocaleString() : '-'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts dailyStats={dailyStats} resultStats={resultStats} />

      {/* PL Summary - Admin Only */}
      {isAdmin && (
        <>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', marginTop: '2rem' }}>予実管理 (PL)</h2>
          <div className="pl-summary">
            <div className="pl-card revenue">
              <div className="card-title">売上</div>
              <div className="card-value" style={{ color: 'var(--color-secondary)' }}>
                ¥{revenue.toLocaleString()}
              </div>
              <div className="card-change positive">
                <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                成約 {monthStats.contracts}件 × ¥{(budget?.revenue_per_contract || 500000).toLocaleString()}
              </div>
            </div>

            <div className="pl-card cost">
              <div className="card-title">コスト</div>
              <div className="card-value" style={{ color: 'var(--color-danger)' }}>
                ¥{totalCost.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                <div>固定費: ¥{(budget?.fixed_cost || 1000000).toLocaleString()}</div>
                <div>変動費: ¥{variableCost.toLocaleString()}</div>
              </div>
            </div>

            <div className="pl-card profit">
              <div className="card-title">営業利益</div>
              <div className="card-value" style={{ color: profit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                ¥{profit.toLocaleString()}
              </div>
              <div className={`card-change ${profit >= 0 ? 'positive' : 'negative'}`}>
                {profit >= 0 ? <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> : <TrendingDown size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />}
                利益率 {profitRate}% (目標: {budget?.target_profit_rate || 20}%)
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
