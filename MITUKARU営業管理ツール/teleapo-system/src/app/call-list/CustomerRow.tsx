'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Globe, ChevronDown, ChevronUp, Building2, User, Mail, Clock, Save, CheckCircle, MapPin, Calendar } from 'lucide-react';
import ScheduleModal from '@/components/ScheduleModal';

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
    result: string;
    notes: string;
    created_at: string;
    user_name: string;
}

interface CustomerRowProps {
    customer: Customer;
    statusLabels: Record<string, string>;
    callLogs: CallLog[];
}

export default function CustomerRow({ customer, statusLabels, callLogs }: CustomerRowProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [result, setResult] = useState('');
    const [notes, setNotes] = useState('');
    const [nextActionDate, setNextActionDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Edit data for customer info
    const [editData, setEditData] = useState({
        company_name: customer.company_name,
        contact_name: customer.contact_name || '',
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        website: customer.website || '',
        notes: customer.notes || '',
    });

    // Update editData when customer changes
    useEffect(() => {
        setEditData({
            company_name: customer.company_name,
            contact_name: customer.contact_name || '',
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || '',
            website: customer.website || '',
            notes: customer.notes || '',
        });
    }, [customer]);

    const resultLabels: Record<string, string> = {
        new: '未着手',
        unreachable: '不通',
        recall: '再架電',
        callback: '折り返し待ち',
        appointed: 'アポ獲得',
        ng: 'NG',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!result) return;

        setLoading(true);
        setSuccess(false);

        try {
            // Save customer info first
            await fetch(`/api/customers/${customer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });

            // Then save call log
            const response = await fetch('/api/call-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customer.id,
                    result,
                    notes,
                    nextActionDate: nextActionDate || null,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                setResult('');
                setNotes('');
                setNextActionDate('');
                router.refresh();

                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="customer-row-container">
            {/* Collapsed Row */}
            <div
                className={`customer-row ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="customer-row-cell company">
                    <Building2 size={16} className="customer-row-icon" />
                    <span className="customer-row-company-name">{customer.company_name}</span>
                </div>
                <div className="customer-row-cell status">
                    <span className={`badge badge-${customer.status}`}>
                        {statusLabels[customer.status]}
                    </span>
                </div>
                <div className="customer-row-cell phone">
                    <Phone size={14} className="customer-row-icon" />
                    <a
                        href={`tel:${customer.phone}`}
                        onClick={handlePhoneClick}
                        className="customer-row-phone-link"
                    >
                        {customer.phone}
                    </a>
                </div>
                <div className="customer-row-cell website">
                    {customer.website ? (
                        <a
                            href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className="customer-row-website-link"
                        >
                            <Globe size={14} />
                            <span className="website-url-text">
                                {customer.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                            </span>
                        </a>
                    ) : (
                        <span className="customer-row-no-website">-</span>
                    )}
                </div>
                <div className="customer-row-cell expand">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {/* Expanded Detail */}
            {isExpanded && (
                <div className="customer-detail-panel">
                    <div className="customer-detail-grid">
                        {/* Left Column - Basic Info (Always Editable) */}
                        <div className="customer-detail-left">
                            <h3 className="customer-detail-section-title">基本情報</h3>

                            <div className="inline-edit-grid">
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <Building2 size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">会社名</label>
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editData.company_name}
                                            onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">住所</label>
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            placeholder="住所を入力"
                                        />
                                    </div>
                                </div>
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <User size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">担当者</label>
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editData.contact_name}
                                            onChange={(e) => setEditData({ ...editData, contact_name: e.target.value })}
                                            placeholder="担当者名を入力"
                                        />
                                    </div>
                                </div>
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <Phone size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">電話番号</label>
                                        <input
                                            type="tel"
                                            className="inline-edit-input"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <Mail size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">メール</label>
                                        <input
                                            type="email"
                                            className="inline-edit-input"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            placeholder="メールアドレスを入力"
                                        />
                                    </div>
                                </div>
                                <div className="inline-edit-item">
                                    <div className="inline-edit-icon">
                                        <Globe size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">会社URL</label>
                                        <input
                                            type="url"
                                            className="inline-edit-input"
                                            value={editData.website}
                                            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>
                            </div>

                            {customer.next_action_date && (
                                <div className="inline-edit-item highlight" style={{ marginTop: '0.75rem' }}>
                                    <div className="inline-edit-icon">
                                        <Clock size={16} />
                                    </div>
                                    <div className="inline-edit-content">
                                        <label className="inline-edit-label">次回アクション</label>
                                        <span className="info-value">{customer.next_action_date}</span>
                                    </div>
                                </div>
                            )}

                            {/* Call History */}
                            <h3 className="customer-detail-section-title" style={{ marginTop: '1.5rem' }}>架電履歴</h3>
                            {callLogs.length === 0 ? (
                                <p className="no-history">履歴はありません</p>
                            ) : (
                                <div className="call-history-list">
                                    {callLogs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="call-history-item">
                                            <div className="call-history-header">
                                                <span className={`badge badge-sm badge-${log.result === 'appointed' ? 'appointed' : log.result === 'ng' ? 'ng' : 'calling'}`}>
                                                    {resultLabels[log.result] || log.result}
                                                </span>
                                                <span className="call-history-date">
                                                    {new Date(log.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {log.notes && <p className="call-history-notes">{log.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Status & Call Form */}
                        <div className="customer-detail-right">
                            <h3 className="customer-detail-section-title">架電結果入力</h3>

                            {success && (
                                <div className="success-message">
                                    <CheckCircle size={16} />
                                    保存しました
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="call-form">
                                <div className="form-group">
                                    <label className="form-label">結果 *</label>
                                    <div className="result-buttons">
                                        {[
                                            { value: 'new', label: '未着手' },
                                            { value: 'unreachable', label: '不通' },
                                            { value: 'recall', label: '再架電' },
                                            { value: 'callback', label: '折り返し待ち' },
                                            { value: 'appointed', label: 'アポ獲得' },
                                            { value: 'ng', label: 'NG' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setResult(option.value)}
                                                className={`btn btn-sm ${result === option.value ? 'btn-primary' : 'btn-outline'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Schedule Button - Above next action date */}
                                <button
                                    type="button"
                                    className="schedule-btn"
                                    onClick={() => setShowScheduleModal(true)}
                                >
                                    <Calendar size={16} />
                                    商談担当者の空きスケジュールを確認
                                </button>

                                <div className="form-group">
                                    <label className="form-label">次回アクション日</label>
                                    <input
                                        type="date"
                                        className="form-input form-input-sm"
                                        value={nextActionDate}
                                        onChange={(e) => setNextActionDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">メモ</label>
                                    <textarea
                                        className="form-textarea"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="会話内容や次回連絡時の注意点など..."
                                        rows={4}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    disabled={!result || loading}
                                >
                                    <Save size={16} />
                                    {loading ? '保存中...' : '結果を保存'}
                                </button>
                            </form>

                            {/* Customer Notes */}
                            {editData.notes && (
                                <div className="customer-notes">
                                    <h4>顧客メモ</h4>
                                    <textarea
                                        className="form-textarea"
                                        value={editData.notes}
                                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                        rows={3}
                                        placeholder="顧客に関するメモを入力..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                customerEmail={editData.email || customer.email}
                customerName={editData.contact_name || customer.contact_name || ''}
                companyName={editData.company_name || customer.company_name}
                onBook={async (slot) => {
                    setNextActionDate(slot.date);
                    setShowScheduleModal(false);
                }}
            />
        </div>
    );
}


