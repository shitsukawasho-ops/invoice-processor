"use client";

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';

interface Metric {
    label: string;
    value: number;
    change: number;
    color: 'blue' | 'red' | 'green' | 'gray';
}

interface ScorecardMultiProps {
    title: string;
    metrics: Metric[];
    chartType: 'line' | 'area' | 'bar' | 'bar_stacked';
    data: any[];
}

const COLORS = {
    blue: '#1da1f2',
    red: '#e0245e',
    green: '#17bf63',
    gray: '#657786',
};

export const ScorecardMulti: React.FC<ScorecardMultiProps> = ({ title, metrics, chartType, data }) => {
    return (
        <div className="card h-[360px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {title}
                </h3>
            </div>

            {/* Metrics Row */}
            <div className="flex gap-8 mb-6">
                {metrics.map((m, i) => (
                    <div key={i}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[m.color] }}></span>
                            <span className="text-xs font-bold text-text-secondary">{m.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary leading-none mb-1">
                            {m.value.toLocaleString()}
                        </div>
                        <div className={clsx(
                            "text-xs font-bold flex items-center",
                            m.change >= 0 ? "text-secondary" : "text-accent"
                        )}>
                            {m.change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(m.change)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e8ed" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="followers" stroke={COLORS.blue} fillOpacity={1} fill="url(#colorBlue)" strokeWidth={2} />
                        </AreaChart>
                    ) : chartType === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e8ed" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="tweets" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={8} />
                        </BarChart>
                    ) : (
                        <LineChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e8ed" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#657786' }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="followers" stroke={COLORS.red} strokeWidth={2} dot={false} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="text-right mt-2 text-xs text-text-muted cursor-pointer hover:text-primary">
                詳細を表示 &gt;
            </div>
        </div>
    );
};
