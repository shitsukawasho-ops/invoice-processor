'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, X, Check } from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    contact_name: string;
    phone: string;
    email: string;
    notes: string | null;
}

interface CustomerEditFormProps {
    customer: Customer;
}

export default function CustomerEditForm({ customer }: CustomerEditFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        company_name: customer.company_name,
        contact_name: customer.contact_name,
        phone: customer.phone,
        email: customer.email || '',
        notes: customer.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/customers/${customer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('更新に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            company_name: customer.company_name,
            contact_name: customer.contact_name,
            phone: customer.phone,
            email: customer.email || '',
            notes: customer.notes || '',
        });
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <button
                className="btn btn-outline"
                onClick={() => setIsEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Edit2 size={16} />
                編集
            </button>
        );
    }

    return (
        <div className="card" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>顧客情報の編集</h3>
                <button
                    onClick={handleCancel}
                    className="btn btn-ghost"
                    style={{ padding: '0.25rem' }}
                >
                    <X size={20} />
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="company_name">会社名 *</label>
                    <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contact_name">担当者名</label>
                    <input
                        type="text"
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">電話番号 *</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">メールアドレス</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">備考</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Check size={16} />
                        {isLoading ? '保存中...' : '保存'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
}
