'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle, DollarSign, Target, TrendingUp } from 'lucide-react';

interface Budget {
  id?: number;
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

interface BudgetSettingsProps {
  initialBudget?: Budget;
  year: number;
  month: number;
}

export default function BudgetSettings({ initialBudget, year, month }: BudgetSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Budget>({
    year,
    month,
    target_calls: initialBudget?.target_calls || 500,
    target_appointments: initialBudget?.target_appointments || 50,
    target_contracts: initialBudget?.target_contracts || 10,
    fixed_cost: initialBudget?.fixed_cost || 1000000,
    cpa: initialBudget?.cpa || 5000,
    revenue_per_contract: initialBudget?.revenue_per_contract || 500000,
    target_profit_rate: initialBudget?.target_profit_rate || 20,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preview calculations
  const projectedRevenue = formData.target_contracts * formData.revenue_per_contract;
  const projectedVariableCost = formData.target_calls * formData.cpa;
  const projectedTotalCost = formData.fixed_cost + projectedVariableCost;
  const projectedProfit = projectedRevenue - projectedTotalCost;
  const projectedProfitRate = projectedRevenue > 0 ? Math.round((projectedProfit / projectedRevenue) * 100) : 0;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {year}年{month}月の設定
        </h2>

        {success && (
          <div style={{ 
            background: '#d1fae5', 
            color: '#065f46', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} />
            設定を保存しました
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} />
            目標設定
          </h3>
          <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">目標架電数</label>
              <input
                type="number"
                className="form-input"
                value={formData.target_calls}
                onChange={(e) => setFormData({ ...formData, target_calls: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">目標アポ数</label>
              <input
                type="number"
                className="form-input"
                value={formData.target_appointments}
                onChange={(e) => setFormData({ ...formData, target_appointments: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">目標成約数</label>
              <input
                type="number"
                className="form-input"
                value={formData.target_contracts}
                onChange={(e) => setFormData({ ...formData, target_contracts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} />
            コスト設定
          </h3>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">固定人件費（月額）</label>
              <input
                type="number"
                className="form-input"
                value={formData.fixed_cost}
                onChange={(e) => setFormData({ ...formData, fixed_cost: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CPA（架電単価）</label>
              <input
                type="number"
                className="form-input"
                value={formData.cpa}
                onChange={(e) => setFormData({ ...formData, cpa: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} />
            売上設定
          </h3>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">成約単価</label>
              <input
                type="number"
                className="form-input"
                value={formData.revenue_per_contract}
                onChange={(e) => setFormData({ ...formData, revenue_per_contract: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">目標利益率（%）</label>
              <input
                type="number"
                className="form-input"
                value={formData.target_profit_rate}
                onChange={(e) => setFormData({ ...formData, target_profit_rate: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            {loading ? '保存中...' : '設定を保存'}
          </button>
        </form>
      </div>

      {/* Preview */}
      <div className="card" style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>目標達成時のPL予測</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#065f46' }}>売上</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}>
              ¥{projectedRevenue.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>コスト合計</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>
              ¥{projectedTotalCost.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.5rem' }}>
              固定費: ¥{formData.fixed_cost.toLocaleString()}<br/>
              変動費: ¥{projectedVariableCost.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '1rem', background: projectedProfit >= 0 ? '#dbeafe' : '#fee2e2', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: projectedProfit >= 0 ? '#1e40af' : '#991b1b' }}>営業利益</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: projectedProfit >= 0 ? '#1e40af' : '#991b1b' }}>
              ¥{projectedProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: projectedProfit >= 0 ? '#1e40af' : '#991b1b' }}>
              利益率: {projectedProfitRate}% {projectedProfitRate >= formData.target_profit_rate ? '✓' : '(目標未達)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
