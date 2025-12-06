'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

interface DashboardChartsProps {
    dailyStats: {
        date: string;
        calls: number;
        appointments: number;
    }[];
    resultStats: {
        name: string;
        value: number;
    }[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

export default function DashboardCharts({ dailyStats = [], resultStats = [] }: DashboardChartsProps) {
    if (!dailyStats || !resultStats) {
        return <div className="text-center p-4 text-gray-500">データ読み込み中...</div>;
    }
    return (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
            {/* Daily Activity Chart */}
            <div className="card" style={{ minHeight: '400px' }}>
                <h3 className="card-title">日別活動推移</h3>
                <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer>
                        <AreaChart data={dailyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="calls"
                                name="架電数"
                                stroke="#2563eb"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCalls)"
                            />
                            <Area
                                type="monotone"
                                dataKey="appointments"
                                name="アポ数"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorApps)"
                            />
                            <Legend iconType="circle" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Result Distribution Chart */}
            <div className="card" style={{ minHeight: '400px' }}>
                <h3 className="card-title">架電結果内訳</h3>
                <div style={{ width: '100%', height: '320px' }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={resultStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {resultStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
