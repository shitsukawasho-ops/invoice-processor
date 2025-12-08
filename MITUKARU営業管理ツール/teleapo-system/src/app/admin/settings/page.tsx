import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import pool from '@/utils/db';
import KPISimulator from './KPISimulator';

interface KPISettings {
  id: number;
  year: number;
  month: number;
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

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const now = new Date();
  const { rows } = await pool.query(
    `SELECT * FROM kpi_settings WHERE year = $1 AND month = $2`,
    [now.getFullYear(), now.getMonth() + 1]
  );
  const currentSettings = rows[0] as KPISettings | undefined;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">KPI目標逆算シミュレーター</h1>
          <p className="page-subtitle">目標採用人数から必要な行動量と収支を自動算出</p>
        </div>
      </div>

      <KPISimulator
        initialSettings={currentSettings || null}
        year={now.getFullYear()}
        month={now.getMonth() + 1}
      />
    </Layout>
  );
}
