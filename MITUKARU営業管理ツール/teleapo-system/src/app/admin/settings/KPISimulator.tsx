'use client';

import { useState, useMemo } from 'react';
import { Save, TrendingUp, TrendingDown, Target, Phone, Users, FileCheck, Briefcase, DollarSign, Calculator, AlertTriangle } from 'lucide-react';

interface KPISettings {
    id?: number;
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

interface KPISimulatorProps {
    initialSettings: KPISettings | null;
    year: number;
    month: number;
}

interface CalculatedKPIs {
    targetHires: number;
    jobRequests: number;
    contracts: number;
    meetings: number;
    appointments: number;
    calls: number;
    revenue: number;
    callCost: number;
    totalCost: number;
    profit: number;
    profitRate: number;
    cpaContract: number;
    cpaHire: number;
}

function calculateKPIs(settings: KPISettings): CalculatedKPIs {
    // Convert percentage to decimal, prevent division by zero (minimum 0.01%)
    const toDecimal = (rate: number) => Math.max(rate, 0.01) / 100;

    const targetHires = settings.target_hires;

    // Reverse funnel calculation (bottom to top)
    // 採用人数 → 求人依頼数 → 契約数 → 商談数 → アポ数 → 架電数
    const jobRequests = Math.ceil(targetHires / toDecimal(settings.hire_job_rate));
    const contracts = Math.ceil(jobRequests / toDecimal(settings.job_contract_rate));
    const meetings = Math.ceil(contracts / toDecimal(settings.contract_mtg_rate));
    const appointments = Math.ceil(meetings / toDecimal(settings.mtg_ap_rate));
    const calls = Math.ceil(appointments / toDecimal(settings.cr_ap_rate));

    // PL calculation
    const revenue = targetHires * settings.revenue_per_hire;
    const callCost = calls * settings.cost_per_call;
    const totalCost = settings.fixed_cost + callCost + settings.variable_cost;
    const profit = revenue - totalCost;
    const profitRate = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Investment metrics
    const cpaContract = contracts > 0 ? Math.round(totalCost / contracts) : 0;
    const cpaHire = targetHires > 0 ? Math.round(totalCost / targetHires) : 0;

    return {
        targetHires,
        jobRequests,
        contracts,
        meetings,
        appointments,
        calls,
        revenue,
        callCost,
        totalCost,
        profit,
        profitRate,
        cpaContract,
        cpaHire,
    };
}

export default function KPISimulator({ initialSettings, year, month }: KPISimulatorProps) {
    const defaultSettings: KPISettings = {
        year,
        month,
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

    const [settings, setSettings] = useState<KPISettings>(initialSettings || defaultSettings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const kpis = useMemo(() => calculateKPIs(settings), [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/kpi-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: keyof KPISettings, value: number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('ja-JP').format(value);
    };

    // Helper for range inputs
    const RangeInput = ({
        label,
        value,
        onChange,
        min = 0,
        max = 100,
        step = 1,
        unit = '%',
        description
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void,
        min?: number,
        max?: number,
        step?: number,
        unit?: string,
        description?: string
    }) => (
        <div className="form-group range-group">
            <div className="range-header">
                <label className="form-label">{label}</label>
                <div className="range-value-display">
                    <input
                        type="number"
                        className="form-input range-number-input"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        min={min}
                        max={max}
                        step={step}
                    />
                    <span className="input-unit">{unit}</span>
                </div>
            </div>
            <input
                type="range"
                className="form-range"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
            />
            {description && <span className="form-hint">{description}</span>}
        </div>
    );

    return (
        <div className="kpi-simulator">
            {/* Header with Save Button */}
            <div className="simulator-header">
                <div>
                    <h2 className="simulator-title">KPI目標逆算シミュレーター</h2>
                    <span className="simulator-period">{year}年{month}月度</span>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={16} />
                    {saving ? '保存中...' : saved ? '保存しました！' : '設定を保存'}
                </button>
            </div>

            <div className="simulator-grid">
                {/* Left: Input Parameters */}
                <div className="simulator-inputs">
                    {/* Goal Setting */}
                    <div className="card input-card">
                        <h3 className="card-section-title">
                            <Target size={18} />
                            ゴール設定（KGI）
                        </h3>
                        <div className="goal-input-container">
                            <label className="goal-label">月間目標採用人数</label>
                            <div className="goal-input-wrapper">
                                <input
                                    type="number"
                                    className="goal-input"
                                    value={settings.target_hires}
                                    onChange={(e) => updateSetting('target_hires', parseInt(e.target.value) || 0)}
                                    min="1"
                                />
                                <span className="goal-unit">人</span>
                            </div>
                            <p className="goal-hint">ここに入力した人数から全ての行動量を逆算します</p>
                        </div>
                    </div>

                    {/* Conversion Rates */}
                    <div className="card input-card">
                        <h3 className="card-section-title">
                            <TrendingUp size={18} />
                            プロセス転換率（歩留まり）
                        </h3>
                        <div className="rate-inputs">
                            <RangeInput
                                label="CR/AP率（架電→アポ）"
                                value={settings.cr_ap_rate}
                                onChange={(val) => updateSetting('cr_ap_rate', val)}
                                min={0.1} max={10} step={0.1}
                                description="一般的に0.5%〜2.0%程度"
                            />
                            <RangeInput
                                label="MTG/AP率（アポ→商談）"
                                value={settings.mtg_ap_rate}
                                onChange={(val) => updateSetting('mtg_ap_rate', val)}
                                min={50} max={100} step={1}
                                description="キャンセル率を考慮"
                            />
                            <RangeInput
                                label="契約/MTG率（商談→成約）"
                                value={settings.contract_mtg_rate}
                                onChange={(val) => updateSetting('contract_mtg_rate', val)}
                                min={10} max={90} step={1}
                                description="商談の質に依存"
                            />
                            <RangeInput
                                label="求人依頼/契約率（成約→案件化）"
                                value={settings.job_contract_rate}
                                onChange={(val) => updateSetting('job_contract_rate', val)}
                                min={50} max={100} step={1}
                            />
                            <RangeInput
                                label="採用/求人依頼率（案件→採用）"
                                value={settings.hire_job_rate}
                                onChange={(val) => updateSetting('hire_job_rate', val)}
                                min={10} max={100} step={1}
                            />
                        </div>
                    </div>

                    {/* Cost Settings */}
                    <div className="card input-card">
                        <h3 className="card-section-title">
                            <DollarSign size={18} />
                            単価・コスト設定
                        </h3>
                        <div className="cost-inputs">
                            <div className="form-group">
                                <label className="form-label">売上単価（採用1人あたり）</label>
                                <div className="input-with-unit">
                                    <span className="input-prefix">¥</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.revenue_per_hire}
                                        onChange={(e) => updateSetting('revenue_per_hire', parseInt(e.target.value) || 0)}
                                        step="1000"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">CALL単価（1架電あたり）</label>
                                <div className="input-with-unit">
                                    <span className="input-prefix">¥</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.cost_per_call}
                                        onChange={(e) => updateSetting('cost_per_call', parseInt(e.target.value) || 0)}
                                        step="1"
                                    />
                                </div>
                            </div>
                            <div className="grid-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">固定費（月額）</label>
                                    <div className="input-with-unit">
                                        <span className="input-prefix">¥</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.fixed_cost}
                                            onChange={(e) => updateSetting('fixed_cost', parseInt(e.target.value) || 0)}
                                            step="10000"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">その他変動費</label>
                                    <div className="input-with-unit">
                                        <span className="input-prefix">¥</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.variable_cost}
                                            onChange={(e) => updateSetting('variable_cost', parseInt(e.target.value) || 0)}
                                            step="10000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Calculated Results */}
                <div className="simulator-results">
                    {/* Action KPI - Most Important */}
                    <div className="card result-card highlight-card">
                        <div className="action-kpi-header">
                            <Phone size={24} />
                            <h3>必要行動量（Action KPI）</h3>
                        </div>
                        <div className="action-kpi-content">
                            <div className="kpi-main-value">{formatNumber(kpis.calls)}</div>
                            <div className="kpi-main-label">件 / 月</div>
                        </div>
                        <div className="action-kpi-daily">
                            <span>1日あたり(20営業日換算): </span>
                            <strong>{formatNumber(Math.ceil(kpis.calls / 20))}</strong>
                            <span> 件</span>
                        </div>
                    </div>

                    {/* Funnel Visualization */}
                    <div className="card result-card">
                        <h3 className="card-section-title">
                            <Users size={18} />
                            ファネルシミュレーション
                        </h3>
                        <div className="funnel-visual">
                            <div className="funnel-step step-1">
                                <div className="step-info">
                                    <span className="step-label">架電数</span>
                                    <span className="step-value">{formatNumber(kpis.calls)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '100%' }}></div>
                                <div className="step-rate">CR/AP {settings.cr_ap_rate}%</div>
                            </div>
                            <div className="funnel-step step-2">
                                <div className="step-info">
                                    <span className="step-label">アポ数</span>
                                    <span className="step-value">{formatNumber(kpis.appointments)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '85%' }}></div>
                                <div className="step-rate">MTG/AP {settings.mtg_ap_rate}%</div>
                            </div>
                            <div className="funnel-step step-3">
                                <div className="step-info">
                                    <span className="step-label">商談数</span>
                                    <span className="step-value">{formatNumber(kpis.meetings)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '70%' }}></div>
                                <div className="step-rate">契約/MTG {settings.contract_mtg_rate}%</div>
                            </div>
                            <div className="funnel-step step-4">
                                <div className="step-info">
                                    <span className="step-label">契約数</span>
                                    <span className="step-value">{formatNumber(kpis.contracts)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '55%' }}></div>
                                <div className="step-rate">求人/契約 {settings.job_contract_rate}%</div>
                            </div>
                            <div className="funnel-step step-5">
                                <div className="step-info">
                                    <span className="step-label">求人依頼</span>
                                    <span className="step-value">{formatNumber(kpis.jobRequests)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '40%' }}></div>
                                <div className="step-rate">採用/求人 {settings.hire_job_rate}%</div>
                            </div>
                            <div className="funnel-step step-6">
                                <div className="step-info">
                                    <span className="step-label">採用人数</span>
                                    <span className="step-value highlight">{formatNumber(kpis.targetHires)}</span>
                                </div>
                                <div className="step-bar" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* PL Prediction */}
                    <div className="card result-card">
                        <h3 className="card-section-title">
                            <Briefcase size={18} />
                            予測PL（収支計算）
                        </h3>
                        <div className="pl-visual">
                            <div className="pl-bar-group">
                                <div className="pl-bar-label">売上</div>
                                <div className="pl-bar-track">
                                    <div className="pl-bar revenue-bar" style={{ width: '100%' }}>
                                        {formatCurrency(kpis.revenue)}
                                    </div>
                                </div>
                            </div>
                            <div className="pl-bar-group">
                                <div className="pl-bar-label">コスト</div>
                                <div className="pl-bar-track">
                                    <div className="pl-bar cost-bar" style={{ width: `${Math.min((kpis.totalCost / kpis.revenue) * 100, 100)}%` }}>
                                        {formatCurrency(kpis.totalCost)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pl-details">
                            <div className="pl-detail-row">
                                <span>架電コスト</span>
                                <span>{formatCurrency(kpis.callCost)}</span>
                            </div>
                            <div className="pl-detail-row">
                                <span>固定費・その他</span>
                                <span>{formatCurrency(settings.fixed_cost + settings.variable_cost)}</span>
                            </div>
                            <div className="pl-divider"></div>
                            <div className={`pl-detail-row profit-row ${kpis.profit >= 0 ? 'positive' : 'negative'}`}>
                                <span>営業利益</span>
                                <span className="profit-value">{formatCurrency(kpis.profit)}</span>
                            </div>
                            <div className="pl-profit-rate">
                                利益率: <strong>{kpis.profitRate.toFixed(1)}%</strong>
                            </div>
                        </div>
                    </div>

                    {/* Investment Metrics */}
                    <div className="grid-2 gap-4">
                        <div className="card result-card metric-card">
                            <div className="metric-label">CPA (契約)</div>
                            <div className="metric-value">{formatCurrency(kpis.cpaContract)}</div>
                        </div>
                        <div className="card result-card metric-card">
                            <div className="metric-label">CPA (採用)</div>
                            <div className="metric-value">{formatCurrency(kpis.cpaHire)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
