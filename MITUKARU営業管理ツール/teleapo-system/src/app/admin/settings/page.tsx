import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/components/Layout';
import db from '@/lib/db';
import BudgetSettings from './BudgetSettings';

interface Budget {
  id: number;
  year: number;
  month: number;
  target_calls: number;
  target_appointments: number;
  target_contracts: number;
  fixed_cost: number;
  cpa: number;
  revenue_per_contract: number;
  target_profit_rate: number;
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const now = new Date();
  const currentBudget = db.prepare(`
    SELECT * FROM budgets WHERE year = ? AND month = ?
  `).get(now.getFullYear(), now.getMonth() + 1) as Budget | undefined;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">予算・係数設定</h1>
        <p className="page-subtitle">月次目標とPL計算の基準値を設定</p>
      </div>
      
      <BudgetSettings 
        initialBudget={currentBudget}
        year={now.getFullYear()}
        month={now.getMonth() + 1}
      />
    </Layout>
  );
}
