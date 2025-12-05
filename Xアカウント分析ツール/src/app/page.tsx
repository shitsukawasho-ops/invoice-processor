"use client";

import React, { useState } from 'react';
import { xApi, XAccount, XTweet } from '@/services/x-api';
import { Header } from '@/components/Dashboard/Header';
import { GrowthChart } from '@/components/Dashboard/GrowthChart';
import { Heatmap } from '@/components/Dashboard/Heatmap';
import { PostTypeChart } from '@/components/Dashboard/PostTypeChart';
import { WordCloud } from '@/components/Dashboard/WordCloud';
import { PostList } from '@/components/Dashboard/PostList';
import { Search, Loader2, Calendar, ChevronDown } from 'lucide-react';
import { ScorecardMulti } from '@/components/Dashboard/ScorecardMulti';

export default function Dashboard() {
  const [username, setUsername] = useState('elonmusk'); // Default for demo
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<XAccount | null>(null);
  const [tweets, setTweets] = useState<XTweet[]>([]);

  // Initial load effect could be added here, but for now we rely on user action or default
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const acc = await xApi.getAccount(username);
        setAccount(acc);
        const t = await xApi.getTweets(acc.id, 100);
        setTweets(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process Data
  const growthData = tweets.map(t => ({
    date: new Date(t.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
    followers: account ? account.public_metrics.followers_count + Math.floor(Math.random() * 500 - 250) : 0,
    tweets: Math.floor(Math.random() * 5),
  })).reverse().slice(-14); // Last 14 days for cleaner view

  return (
    <main className="min-h-screen pb-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-text-primary">ダッシュボード</h1>

        <div className="flex items-center gap-2">
          <button className="btn btn-outline bg-white text-xs px-3 py-1.5 h-8 gap-1">
            <Calendar size={14} /> 30日前
          </button>
          <div className="flex bg-white rounded-md border border-border p-0.5">
            <button className="px-3 py-1 text-xs font-medium rounded-sm hover:bg-background">日</button>
            <button className="px-3 py-1 text-xs font-medium rounded-sm bg-primary/10 text-primary">週</button>
            <button className="px-3 py-1 text-xs font-medium rounded-sm hover:bg-background">月</button>
          </div>
          <button className="btn btn-outline bg-white text-xs px-3 py-1.5 h-8">
            2024/5/1 - 2024/5/29
          </button>
        </div>
      </div>

      {account && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Row 1: Key Metrics (Reference: Top Left & Top Right Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Summary */}
            <ScorecardMulti
              title="エンゲージメント"
              metrics={[
                { label: '返信', value: 1452, change: 24, color: 'blue' },
                { label: 'いいね', value: 3770, change: 24, color: 'red' },
                { label: 'リポスト', value: 741, change: 24, color: 'green' }
              ]}
              chartType="line"
              data={growthData} // Mock data for sparkline
            />

            {/* Follower Summary */}
            <ScorecardMulti
              title="フォロワー"
              metrics={[
                { label: 'フォロワー', value: account.public_metrics.followers_count, change: 420, color: 'blue' },
                { label: 'フォロー', value: account.public_metrics.following_count, change: -58, color: 'gray' },
                { label: 'FF比', value: Number((account.public_metrics.followers_count / account.public_metrics.following_count).toFixed(2)), change: 0, color: 'gray' }
              ]}
              chartType="area"
              data={growthData}
            />
          </div>

          {/* Row 2: Activity Breakdown (Reference: Bottom Left & Bottom Right Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Post Activity */}
            <ScorecardMulti
              title="投稿アクティビティ"
              metrics={[
                { label: '自分の通常投稿', value: 840, change: 36, color: 'blue' },
                { label: '自分からの返信', value: 218, change: 18, color: 'green' },
                { label: '自分からのリポスト', value: 156, change: -4, color: 'red' }
              ]}
              chartType="bar"
              data={growthData}
            />

            {/* Follower Net Growth */}
            <ScorecardMulti
              title="フォロワー獲得"
              metrics={[
                { label: 'フォロワー純増', value: 421, change: 80, color: 'blue' },
                { label: 'フォロー純増', value: -58, change: 20, color: 'gray' }
              ]}
              chartType="bar_stacked"
              data={growthData}
            />
          </div>

          {/* Detailed Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Heatmap data={[]} /> {/* Placeholder data */}
            </div>
            <div className="lg:col-span-1">
              <PostTypeChart data={[
                { type: 'Text', avgImpressions: 1200, avgLikes: 45 },
                { type: 'Image', avgImpressions: 3500, avgLikes: 120 },
                { type: 'Video', avgImpressions: 5000, avgLikes: 200 },
                { type: 'Link', avgImpressions: 800, avgLikes: 15 },
              ]} />
            </div>
            <div className="lg:col-span-1">
              <WordCloud words={[
                { text: 'AI', value: 50, sentiment: 'positive' },
                { text: '成長', value: 30, sentiment: 'positive' },
                { text: '技術', value: 40, sentiment: 'neutral' },
              ]} />
            </div>
          </div>

          <PostList tweets={tweets} />
        </div>
      )}
    </main>
  );
}
