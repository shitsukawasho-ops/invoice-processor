"use client";

import React from 'react';

interface HeatmapProps {
    data: {
        day: string;
        hour: number;
        value: number; // Engagement or frequency
    }[];
}

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    // Normalize data for opacity
    const maxValue = Math.max(...data.map(d => d.value), 1);

    const getValue = (dayIndex: number, hour: number) => {
        const dayName = DAYS_EN[dayIndex];
        const point = data.find(d => d.day === dayName && d.hour === hour);
        return point ? point.value : 0;
    };

    return (
        <div className="card h-[400px] overflow-hidden">
            <div className="card-header">
                <span className="card-title">エンゲージメント・ヒートマップ</span>
            </div>
            <div className="flex flex-col h-full pb-8">
                <div className="flex flex-1">
                    {/* Y-Axis Labels (Days) */}
                    <div className="flex flex-col justify-between pr-2 py-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-xs text-text-secondary h-6 flex items-center font-medium">{day}</div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex-1 grid grid-cols-24 gap-[1px] bg-surface-highlight">
                        {DAYS.map((_, dayIndex) => (
                            HOURS.map(hour => {
                                const value = getValue(dayIndex, hour);
                                const opacity = value / maxValue;
                                return (
                                    <div
                                        key={`${dayIndex}-${hour}`}
                                        className="h-full w-full rounded-[1px] transition-all hover:scale-110 hover:z-10 relative group"
                                        style={{
                                            backgroundColor: `rgba(29, 161, 242, ${opacity * 0.9 + 0.1})`, // Twitter Blue base
                                        }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-text-primary text-surface p-2 rounded text-xs whitespace-nowrap z-20 shadow-lg">
                                            {value} エンゲージメント
                                        </div>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* X-Axis Labels (Hours) */}
                <div className="flex pl-8 mt-2 justify-between text-xs text-text-secondary">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:00</span>
                </div>
            </div>
        </div>
    );
};
