"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface PostTypeChartProps {
    data: {
        type: string;
        avgImpressions: number;
        avgLikes: number;
    }[];
}

const COLORS = {
    Text: '#1da1f2', // Blue
    Image: '#17bf63', // Green
    Video: '#ffad1f', // Orange
    Link: '#657786', // Gray
};

const TYPE_LABELS: Record<string, string> = {
    Text: 'テキスト',
    Image: '画像',
    Video: '動画',
    Link: 'リンク',
};

export const PostTypeChart: React.FC<PostTypeChartProps> = ({ data }) => {
    return (
        <div className="card h-[300px]">
            <div className="card-header">
                <span className="card-title">投稿タイプ別パフォーマンス</span>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid stroke="#e1e8ed" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="type"
                        type="category"
                        stroke="#657786"
                        tick={{ fill: '#657786', fontSize: 12 }}
                        tickFormatter={(value) => TYPE_LABELS[value] || value}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e1e8ed', color: '#14171a', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="avgImpressions" name="平均インプレッション" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
