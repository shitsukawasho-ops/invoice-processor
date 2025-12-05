"use client";

import React, { useState } from 'react';
import { XTweet } from '@/services/x-api';
import { MessageCircle, Repeat, Heart, BarChart2, Image as ImageIcon, FileText } from 'lucide-react';
import clsx from 'clsx';

interface PostListProps {
    tweets: XTweet[];
}

type SortOption = 'likes' | 'impressions' | 'date';
type FilterOption = 'all' | 'media' | 'text';

export const PostList: React.FC<PostListProps> = ({ tweets }) => {
    const [sortBy, setSortBy] = useState<SortOption>('likes');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');

    const filteredTweets = tweets.filter(tweet => {
        if (filterBy === 'media') return tweet.entities?.media;
        if (filterBy === 'text') return !tweet.entities?.media;
        return true;
    });

    const sortedTweets = [...filteredTweets].sort((a, b) => {
        if (sortBy === 'likes') return b.public_metrics.like_count - a.public_metrics.like_count;
        if (sortBy === 'impressions') return b.public_metrics.impression_count - a.public_metrics.impression_count;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const topTweets = sortedTweets.slice(0, 5);
    const worstTweets = [...sortedTweets].reverse().slice(0, 5);

    const TweetCard = ({ tweet, rank, type }: { tweet: XTweet, rank: number, type: 'best' | 'worst' }) => (
        <div className={clsx(
            "card min-w-[300px] max-w-[300px] flex-shrink-0 p-4 border-t-4",
            type === 'best' ? "border-t-secondary" : "border-t-accent"
        )}>
            <div className="flex justify-between items-start mb-2">
                <span className={clsx(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    type === 'best' ? "bg-secondary/10 text-secondary" : "bg-accent/10 text-accent"
                )}>
                    #{rank + 1} {type === 'best' ? 'BEST' : 'WORST'}
                </span>
                <span className="text-xs text-text-muted">{new Date(tweet.created_at).toLocaleDateString('ja-JP')}</span>
            </div>

            <p className="text-sm mb-3 line-clamp-3 h-[60px] text-text-primary">{tweet.text}</p>

            {tweet.entities?.media && (
                <div className="h-32 bg-surface-highlight rounded mb-3 flex items-center justify-center text-text-secondary text-xs gap-2">
                    <ImageIcon size={16} /> メディアあり
                </div>
            )}
            {!tweet.entities?.media && (
                <div className="h-32 bg-surface-highlight/50 rounded mb-3 flex items-center justify-center text-text-muted text-xs gap-2">
                    <FileText size={16} /> テキストのみ
                </div>
            )}

            <div className="grid grid-cols-4 gap-2 text-xs text-text-secondary border-t border-border pt-2">
                <div className="flex flex-col items-center">
                    <Heart size={14} className={sortBy === 'likes' ? "text-accent fill-accent" : ""} />
                    <span className="font-bold">{tweet.public_metrics.like_count}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Repeat size={14} />
                    <span className="font-bold">{tweet.public_metrics.retweet_count}</span>
                </div>
                <div className="flex flex-col items-center">
                    <MessageCircle size={14} />
                    <span className="font-bold">{tweet.public_metrics.reply_count}</span>
                </div>
                <div className="flex flex-col items-center">
                    <BarChart2 size={14} className={sortBy === 'impressions' ? "text-primary" : ""} />
                    <span className="font-bold">{tweet.public_metrics.impression_count}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="text-primary" /> 投稿分析
                </h2>
                <div className="flex gap-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-surface border border-border rounded-md px-3 py-1 text-sm focus:border-primary outline-none text-text-primary"
                    >
                        <option value="likes">いいね数順</option>
                        <option value="impressions">インプレッション順</option>
                        <option value="date">日付順</option>
                    </select>
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                        className="bg-surface border border-border rounded-md px-3 py-1 text-sm focus:border-primary outline-none text-text-primary"
                    >
                        <option value="all">すべての投稿</option>
                        <option value="media">メディアあり</option>
                        <option value="text">テキストのみ</option>
                    </select>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-4 text-secondary flex items-center gap-2">
                    <Heart className="fill-secondary" /> 高評価 (Best 5)
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                    {topTweets.map((tweet, i) => (
                        <TweetCard key={tweet.id} tweet={tweet} rank={i} type="best" />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-4 text-accent flex items-center gap-2">
                    低評価 (Worst 5)
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                    {worstTweets.map((tweet, i) => (
                        <TweetCard key={tweet.id} tweet={tweet} rank={i} type="worst" />
                    ))}
                </div>
            </div>
        </div>
    );
};
