"use client";

import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface GrowthChartProps {
    data: {
        date: string;
        followers: number;
        tweets: number;
    }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
    return (
        <div className="card h-[400px]">
            <div className="card-header">
                <span className="card-title">フォロワー推移と投稿数</span>
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                >
                    <CartesianGrid stroke="#e1e8ed" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#657786"
                        tick={{ fill: '#657786', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#657786"
                        tick={{ fill: '#657786', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'フォロワー数', angle: -90, position: 'insideLeft', fill: '#657786' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#657786"
                        tick={{ fill: '#657786', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'ツイート数', angle: 90, position: 'insideRight', fill: '#657786' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e1e8ed', color: '#14171a', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#14171a' }}
                    />
                    <Legend />
                    <Bar yAxisId="right" dataKey="tweets" barSize={20} fill="#ccd6dd" radius={[4, 4, 0, 0]} name="ツイート数" />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="followers"
                        stroke="#1da1f2"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#1da1f2', stroke: '#fff' }}
                        name="フォロワー数"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
