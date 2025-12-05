import React from 'react';
import { XAccount } from '@/services/x-api';
import { Users, Activity, Heart, Repeat } from 'lucide-react';

interface HeaderProps {
    account: XAccount | null;
    engagementRate: number;
    avgLikes: number;
    avgReposts: number;
}

export const Header: React.FC<HeaderProps> = ({ account, engagementRate, avgLikes, avgReposts }) => {
    if (!account) return null;

    const daysSinceCreation = Math.floor((new Date().getTime() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <header className="grid grid-cols-1 md:grid-cols-4 gap-md mb-8">
            {/* Account Info */}
            <div className="card flex items-center gap-md border-l-4 border-l-primary">
                <img
                    src={account.profile_image_url}
                    alt={account.name}
                    className="w-16 h-16 rounded-full border border-border"
                />
                <div>
                    <h1 className="text-lg font-bold text-text-primary">{account.name}</h1>
                    <p className="text-text-secondary text-sm">@{account.username}</p>
                    <p className="text-xs text-text-muted mt-1">開設から {daysSinceCreation} 日</p>
                </div>
            </div>

            {/* Followers */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title flex items-center gap-2">
                        <Users size={16} /> フォロワー数
                    </span>
                </div>
                <div className="metric-value">{account.public_metrics.followers_count.toLocaleString()}</div>
                <div className="metric-label text-secondary flex items-center gap-1">
                    +{(account.public_metrics.followers_count * 0.05).toFixed(0)} <span className="text-xs text-text-muted">(月次予測)</span>
                </div>
            </div>

            {/* Engagement Rate */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title flex items-center gap-2">
                        <Activity size={16} /> エンゲージメント率
                    </span>
                </div>
                <div className="metric-value">{engagementRate.toFixed(2)}%</div>
                <div className="metric-label">直近30日平均</div>
            </div>

            {/* Avg Actions */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title flex items-center gap-2">
                        <Heart size={16} /> 平均アクション
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xl font-bold text-text-primary">{avgLikes.toLocaleString()}</div>
                        <div className="metric-label flex items-center gap-1"><Heart size={12} /> いいね</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-text-primary">{avgReposts.toLocaleString()}</div>
                        <div className="metric-label flex items-center gap-1 justify-end"><Repeat size={12} /> リポスト</div>
                    </div>
                </div>
            </div>
        </header>
    );
};
