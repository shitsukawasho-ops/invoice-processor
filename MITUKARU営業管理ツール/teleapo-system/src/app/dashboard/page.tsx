import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import pool from '@/utils/db';
import { TrendingUp, TrendingDown, Phone, Calendar, CheckCircle, Users, Briefcase, Target } from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { ssr: false });

interface KPISettings {
  target_hires: number;
  cr_ap_rate: number;
  mtg_ap_rate: number;
  contract_mtg_rate: number;
  job_contract_rate: number;
  hire_job_rate: number;
  revenue_per_hire: number;
  cost_per_call: number;
  fixed_cost: number;
  variable_cost: number;
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

// Calculate targets from KPI settings (same logic as simulator)
function calculateTargets(settings: KPISettings) {
  const toDecimal = (rate: number) => Math.max(rate, 0.01) / 100;

  const targetHires = settings.target_hires;
  const jobRequests = Math.ceil(targetHires / toDecimal(settings.hire_job_rate));
  const contracts = Math.ceil(jobRequests / toDecimal(settings.job_contract_rate));
  const meetings = Math.ceil(contracts / toDecimal(settings.contract_mtg_rate));
  const appointments = Math.ceil(meetings / toDecimal(settings.mtg_ap_rate));
  const calls = Math.ceil(appointments / toDecimal(settings.cr_ap_rate));

  return { targetHires, jobRequests, contracts, meetings, appointments, calls };
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

  // Get KPI settings
  const { rows: kpiRows } = await pool.query<KPISettings>(`
    SELECT * FROM kpi_settings WHERE year = $1 AND month = $2
  `, [year, month]);
  const kpiSettings = kpiRows[0];

  // Default settings if none exist
  const settings: KPISettings = kpiSettings || {
    target_hires: 33,
    cr_ap_rate: 1.0,
    mtg_ap_rate: 95.0,
    contract_mtg_rate: 50.0,
    job_contract_rate: 80.0,
    hire_job_rate: 80.0,
    revenue_per_hire: 70000,
    cost_per_call: 105,
    fixed_cost: 0,
    variable_cost: 0,
  };

  // Calculate targets from KPI settings
  const targets = calculateTargets(settings);

  // Get monthly call stats
  const { rows: monthStatsRows } = await pool.query<CallStats>(`
    SELECT 
      COUNT(*)::int as total_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END)::int as appointments,
      (SELECT COUNT(*) FROM customers WHERE status = 'contracted' AND updated_at >= $1)::int as contracts
    FROM call_logs
    WHERE created_at >= $2
  `, [startOfMonth, startOfMonth]);
  const monthStats = monthStatsRows[0];

  // Get user-specific stats
  const { rows: userStatsRows } = await pool.query<UserStats>(`
    SELECT 
      COUNT(*)::int as user_calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END)::int as user_appointments
    FROM call_logs
    WHERE user_id = $1 AND DATE(created_at) = $2
  `, [userId, today]);
  const userStats = userStatsRows[0] || { user_calls: 0, user_appointments: 0 };

  // Get today's list count for user
  const { rows: todayListCountRows } = await pool.query<{ count: number }>(`
    SELECT COUNT(*)::int as count FROM customers 
    WHERE assigned_to = $1 
    AND (next_action_date = $2 OR (next_action_date IS NULL AND status = 'new'))
  `, [userId, today]);
  const todayListCount = todayListCountRows[0] || { count: 0 };

  // Progress calculations using KPI-based targets
  // 達成率 = 実績 / 目標 × 100
  const callProgress = Math.round((monthStats.total_calls / targets.calls) * 100);
  const appointmentProgress = Math.round((monthStats.appointments / targets.appointments) * 100);
  const contractProgress = Math.round((monthStats.contracts / targets.contracts) * 100);

  // 進捗率 = 実績 / 理想（目標 × 時間経過率）× 100
  // 理想 = 目標 × (経過稼働日 / 総稼働日)
  // → 進捗率 = (実績 / 目標) / (経過稼働日 / 総稼働日) × 100
  const calculateProgressRate = (actual: number, target: number, elapsedDays: number, totalDays: number) => {
    if (elapsedDays === 0 || totalDays === 0) return 0;
    const idealValue = target * (elapsedDays / totalDays);
    return Math.round((actual / idealValue) * 100);
  };

  // Actual conversion rate
  const actualAppoRate = monthStats.total_calls > 0
    ? (monthStats.appointments / monthStats.total_calls) * 100
    : 0;

  // PL calculations
  const revenue = monthStats.contracts * settings.revenue_per_hire;
  const callCost = monthStats.total_calls * settings.cost_per_call;
  const totalCost = settings.fixed_cost + callCost + settings.variable_cost;
  const profit = revenue - totalCost;
  const profitRate = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  // Target revenue/profit from KPI settings
  const targetRevenue = settings.target_hires * settings.revenue_per_hire;
  const targetCallCost = targets.calls * settings.cost_per_call;
  const targetTotalCost = settings.fixed_cost + targetCallCost + settings.variable_cost;
  const targetProfit = targetRevenue - targetTotalCost;

  // Get daily stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  const { rows: dailyData } = await pool.query<{ date: string; calls: number; appointments: number }>(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*)::int as calls,
      SUM(CASE WHEN result = 'appointed' THEN 1 ELSE 0 END)::int as appointments
    FROM call_logs
    WHERE created_at >= $1
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [thirtyDaysAgoStr]);

  // Fill in missing dates
  const dailyStats = [];
  const currentDate = new Date(thirtyDaysAgo);
  currentDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const found = dailyData.find(item => item.date === dateStr);
    dailyStats.push({
      date: dateStr,
      calls: found?.calls || 0,
      appointments: found?.appointments || 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get result distribution
  const { rows: resultData } = await pool.query<{ result: string; count: number }>(`
    SELECT result, COUNT(*)::int as count
    FROM call_logs
    WHERE created_at >= $1
    GROUP BY result
  `, [startOfMonth]);

  const resultLabelMap: Record<string, string> = {
    appointed: 'アポイント',
    unreachable: '不通',
    callback: '折り返し',
    ng: 'NG',
  };

  const resultStats = resultData.map(item => ({
    name: resultLabelMap[item.result] || item.result,
    value: item.count
  })).sort((a, b) => b.value - a.value);

  // Calculate business days (excluding weekends)
  const getBusinessDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const startOfCurrentMonth = new Date(year, month - 1, 1);
  const endOfCurrentMonth = new Date(year, month, 0);
  const totalBusinessDays = getBusinessDays(startOfCurrentMonth, endOfCurrentMonth);

  // Current business day (up to today)
  // If today is past the end of the month (viewing past month), use total days
  // If today is before start of month (future), use 0
  let currentBusinessDay = 0;
  const nowTime = now.getTime();

  if (nowTime > endOfCurrentMonth.getTime()) {
    currentBusinessDay = totalBusinessDays;
  } else if (nowTime >= startOfCurrentMonth.getTime()) {
    currentBusinessDay = getBusinessDays(startOfCurrentMonth, now);
  }

  const timeProgress = totalBusinessDays > 0
    ? Math.round((currentBusinessDay / totalBusinessDays) * 100)
    : 0;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">ダッシュボード</h1>
        <div className="page-header-meta">
          <p className="page-subtitle">{year}年{month}月の実績</p>
          <div className="business-day-info">
            <span className="business-day-label">稼働日経過:</span>
            <span className="business-day-value">{currentBusinessDay}/{totalBusinessDays}日</span>
            <span className="business-day-progress">({timeProgress}%)</span>
          </div>
        </div>
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

      {/* Monthly KPIs - Based on KPI Settings */}
      <div className="dashboard-grid">
        <div className="dashboard-card kpi-card">
          <div className="card-header">
            <div className="icon-wrapper icon-primary">
              <Phone size={24} />
            </div>
            <div className="card-title-wrapper">
              <span className="card-label">架電数</span>
              <span className="card-sublabel">Monthly Calls</span>
            </div>
          </div>
          <div className="card-content">
            <div className="card-main-value">{monthStats.total_calls.toLocaleString()}</div>
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-label">目標: {targets.calls.toLocaleString()}</span>
                <div className="progress-stats">
                  <span className={`progress-rate ${calculateProgressRate(monthStats.total_calls, targets.calls, currentBusinessDay, totalBusinessDays) >= 100 ? 'text-success' : 'text-danger'}`}>
                    進捗率: {calculateProgressRate(monthStats.total_calls, targets.calls, currentBusinessDay, totalBusinessDays)}%
                  </span>
                  <span className="progress-separator">/</span>
                  <span className="progress-percent">達成率: {callProgress}%</span>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${callProgress >= 100 ? 'success' : calculateProgressRate(monthStats.total_calls, targets.calls, currentBusinessDay, totalBusinessDays) >= 100 ? 'primary' : 'warning'}`}
                  style={{ width: `${Math.min(callProgress, 100)}%` }}
                />
                <div
                  className="progress-marker"
                  style={{ left: `${Math.min(timeProgress, 100)}%` }}
                  title={`期間経過: ${timeProgress}%`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card kpi-card">
          <div className="card-header">
            <div className="icon-wrapper icon-secondary">
              <Calendar size={24} />
            </div>
            <div className="card-title-wrapper">
              <span className="card-label">アポ数</span>
              <span className="card-sublabel">Appointments</span>
            </div>
          </div>
          <div className="card-content">
            <div className="card-main-value">{monthStats.appointments}</div>
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-label">目標: {targets.appointments}</span>
                <div className="progress-stats">
                  <span className={`progress-rate ${calculateProgressRate(monthStats.appointments, targets.appointments, currentBusinessDay, totalBusinessDays) >= 100 ? 'text-success' : 'text-danger'}`}>
                    進捗率: {calculateProgressRate(monthStats.appointments, targets.appointments, currentBusinessDay, totalBusinessDays)}%
                  </span>
                  <span className="progress-separator">/</span>
                  <span className="progress-percent">達成率: {appointmentProgress}%</span>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${appointmentProgress >= 100 ? 'success' : calculateProgressRate(monthStats.appointments, targets.appointments, currentBusinessDay, totalBusinessDays) >= 100 ? 'secondary' : 'warning'}`}
                  style={{ width: `${Math.min(appointmentProgress, 100)}%` }}
                />
                <div
                  className="progress-marker"
                  style={{ left: `${Math.min(timeProgress, 100)}%` }}
                  title={`期間経過: ${timeProgress}%`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card kpi-card">
          <div className="card-header">
            <div className="icon-wrapper icon-accent">
              <CheckCircle size={24} />
            </div>
            <div className="card-title-wrapper">
              <span className="card-label">契約数</span>
              <span className="card-sublabel">Contracts</span>
            </div>
          </div>
          <div className="card-content">
            <div className="card-main-value">{monthStats.contracts}</div>
            <div className="progress-container">
              <div className="progress-info">
                <span className="progress-label">目標: {targets.contracts}</span>
                <div className="progress-stats">
                  <span className={`progress-rate ${calculateProgressRate(monthStats.contracts, targets.contracts, currentBusinessDay, totalBusinessDays) >= 100 ? 'text-success' : 'text-danger'}`}>
                    進捗率: {calculateProgressRate(monthStats.contracts, targets.contracts, currentBusinessDay, totalBusinessDays)}%
                  </span>
                  <span className="progress-separator">/</span>
                  <span className="progress-percent">達成率: {contractProgress}%</span>
                </div>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${contractProgress >= 100 ? 'success' : calculateProgressRate(monthStats.contracts, targets.contracts, currentBusinessDay, totalBusinessDays) >= 100 ? 'accent' : 'warning'}`}
                  style={{ width: `${Math.min(contractProgress, 100)}%` }}
                />
                <div
                  className="progress-marker"
                  style={{ left: `${Math.min(timeProgress, 100)}%` }}
                  title={`期間経過: ${timeProgress}%`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card kpi-card">
          <div className="card-header">
            <div className="icon-wrapper icon-warning">
              <Target size={24} />
            </div>
            <div className="card-title-wrapper">
              <span className="card-label">アポ率</span>
              <span className="card-sublabel">Conversion Rate</span>
            </div>
          </div>
          <div className="card-content">
            <div className="card-main-value">{actualAppoRate.toFixed(2)}<span className="unit">%</span></div>
            <div className="kpi-status-badge" style={{
              backgroundColor: actualAppoRate >= settings.cr_ap_rate ? 'var(--color-bg-success)' : 'var(--color-bg-danger)',
              color: actualAppoRate >= settings.cr_ap_rate ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {actualAppoRate >= settings.cr_ap_rate ? '目標達成' : '未達'} (目標 {settings.cr_ap_rate}%)
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-section">
        <DashboardCharts dailyStats={dailyStats} resultStats={resultStats} />
      </div>

      {/* PL Summary - Admin Only */}
      {isAdmin && (
        <div className="dashboard-section">
          <h2 className="section-title">
            <Briefcase size={20} />
            予実管理 (PL)
          </h2>
          <div className="pl-summary-card dashboard-card">
            <div className="pl-visual-container">
              <div className="pl-visual-row">
                <div className="pl-visual-label">
                  <span className="label-main">売上</span>
                  <span className="label-sub">Revenue</span>
                </div>
                <div className="pl-visual-bar-track">
                  <div className="pl-visual-bar revenue-bar" style={{ width: '100%' }}>
                    ¥{revenue.toLocaleString()}
                  </div>
                </div>
                <div className="pl-visual-target">
                  目標: ¥{targetRevenue.toLocaleString()}
                </div>
              </div>

              <div className="pl-visual-row">
                <div className="pl-visual-label">
                  <span className="label-main">コスト</span>
                  <span className="label-sub">Cost</span>
                </div>
                <div className="pl-visual-bar-track">
                  <div className="pl-visual-bar cost-bar" style={{ width: `${Math.min((totalCost / Math.max(revenue, 1)) * 100, 100)}%` }}>
                    ¥{totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="pl-visual-details">
                  (架電: ¥{callCost.toLocaleString()} / 固定: ¥{settings.fixed_cost.toLocaleString()})
                </div>
              </div>
            </div>

            <div className="pl-divider"></div>

            <div className="pl-profit-container">
              <div className="pl-profit-item">
                <div className="profit-label">営業利益</div>
                <div className={`profit-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                  ¥{profit.toLocaleString()}
                </div>
              </div>
              <div className="pl-profit-item">
                <div className="profit-label">利益率</div>
                <div className={`profit-value ${profitRate >= 0 ? 'positive' : 'negative'}`}>
                  {profitRate}%
                </div>
              </div>
              <div className="pl-profit-item">
                <div className="profit-label">目標利益</div>
                <div className="profit-value neutral">
                  ¥{targetProfit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
