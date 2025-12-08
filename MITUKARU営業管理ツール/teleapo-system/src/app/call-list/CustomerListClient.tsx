'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import CustomerRow from './CustomerRow';

interface Customer {
    id: number;
    company_name: string;
    contact_name: string;
    phone: string;
    email: string | null;
    website: string | null;
    address: string | null;
    status: string;
    next_action_date: string | null;
    notes: string | null;
}

interface CallLog {
    id: number;
    customer_id: number;
    result: string;
    notes: string;
    created_at: string;
    user_name: string;
}

interface CustomerListClientProps {
    customers: Customer[];
    statusLabels: Record<string, string>;
    callLogsMap: Record<number, CallLog[]>;
}

// 都道府県リスト
const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export default function CustomerListClient({ customers, statusLabels, callLogsMap }: CustomerListClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [prefectureFilter, setPrefectureFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // フィルタリングされた顧客リスト
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            // 自由検索
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchFields = [
                    customer.company_name,
                    customer.contact_name,
                    customer.phone,
                    customer.email,
                    customer.address,
                    customer.notes,
                ].filter(Boolean).map(f => f!.toLowerCase());

                if (!searchFields.some(field => field.includes(query))) {
                    return false;
                }
            }

            // ステータスフィルター
            if (statusFilter && customer.status !== statusFilter) {
                return false;
            }

            // 都道府県フィルター
            if (prefectureFilter && customer.address) {
                if (!customer.address.includes(prefectureFilter)) {
                    return false;
                }
            } else if (prefectureFilter && !customer.address) {
                return false;
            }

            return true;
        });
    }, [customers, searchQuery, statusFilter, prefectureFilter]);

    const hasActiveFilters = searchQuery || statusFilter || prefectureFilter;

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPrefectureFilter('');
    };

    return (
        <>
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="会社名、担当者、電話番号で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button
                    className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    フィルター
                    {hasActiveFilters && <span className="filter-badge">!</span>}
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="filter-options">
                    <div className="filter-group">
                        <label className="filter-label">ステータス</label>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">すべて</option>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">都道府県</label>
                        <select
                            className="filter-select"
                            value={prefectureFilter}
                            onChange={(e) => setPrefectureFilter(e.target.value)}
                        >
                            <option value="">すべて</option>
                            {prefectures.map((pref) => (
                                <option key={pref} value={pref}>{pref}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button className="filter-clear-btn" onClick={clearFilters}>
                            <X size={14} />
                            フィルターをクリア
                        </button>
                    )}
                </div>
            )}

            {/* Results Count */}
            {hasActiveFilters && (
                <div className="filter-results-count">
                    {filteredCustomers.length}件の結果
                    {filteredCustomers.length !== customers.length && (
                        <span className="filter-total">（全{customers.length}件中）</span>
                    )}
                </div>
            )}

            {/* Customer List Header */}
            <div className="customer-list-header">
                <div className="customer-list-header-cell company">会社名</div>
                <div className="customer-list-header-cell status">ステータス</div>
                <div className="customer-list-header-cell phone">電話番号</div>
                <div className="customer-list-header-cell website">会社URL</div>
                <div className="customer-list-header-cell expand"></div>
            </div>

            {/* Customer List */}
            <div className="customer-list">
                {filteredCustomers.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {hasActiveFilters ? '検索条件に一致する顧客がありません' : '本日の架電対象はありません'}
                        </p>
                        {hasActiveFilters && (
                            <button className="btn btn-outline btn-sm" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                                フィルターをクリア
                            </button>
                        )}
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <CustomerRow
                            key={customer.id}
                            customer={customer}
                            statusLabels={statusLabels}
                            callLogs={callLogsMap[customer.id] || []}
                        />
                    ))
                )}
            </div>
        </>
    );
}
