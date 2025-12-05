"use client";

import React from 'react';

interface WordCloudProps {
    words: {
        text: string;
        value: number; // Frequency or Engagement
        sentiment?: 'positive' | 'neutral' | 'negative';
    }[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
    // Normalize size
    const maxValue = Math.max(...words.map(w => w.value), 1);
    const minValue = Math.min(...words.map(w => w.value), 0);

    const getSize = (value: number) => {
        const minSize = 0.8; // rem
        const maxSize = 2.0; // rem
        return minSize + ((value - minValue) / (maxValue - minValue)) * (maxSize - minSize);
    };

    const getColor = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return '#e0245e'; // Pink/Red
            case 'negative': return '#1da1f2'; // Blue
            default: return '#657786'; // Gray
        }
    };

    return (
        <div className="card h-[300px]">
            <div className="card-header">
                <span className="card-title">トレンドワード</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center items-center h-[85%] overflow-y-auto p-4 content-center bg-background/50 rounded-lg">
                {words.map((word, index) => (
                    <span
                        key={index}
                        className="font-bold transition-all hover:scale-110 cursor-default"
                        style={{
                            fontSize: `${getSize(word.value)}rem`,
                            color: getColor(word.sentiment),
                            opacity: 0.9,
                        }}
                        title={`${word.value} エンゲージメント`}
                    >
                        {word.text}
                    </span>
                ))}
            </div>
        </div>
    );
};
