import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import pool from '@/utils/db';
import CallResultForm from './CallResultForm';
import CustomerEditForm from './CustomerEditForm';
import { Phone, Mail, Building2, Clock, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  id: number;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  status: string;
  next_action_date: string | null;
  notes: string | null;
}

interface CallLog {
  id: number;
  result: string;
  notes: string;
  next_action_date: string | null;
  created_at: string;
  user_name: string;
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const customerId = parseInt(resolvedParams.id);

  const { rows: customerRows } = await pool.query<Customer>(`
    SELECT * FROM customers WHERE id = $1
  `, [customerId]);
  const customer = customerRows[0];

  if (!customer) {
    redirect('/call-list');
  }

  const { rows: callLogs } = await pool.query<CallLog>(`
    SELECT cl.*, u.name as user_name
    FROM call_logs cl
    JOIN users u ON cl.user_id = u.id
    WHERE cl.customer_id = $1
    ORDER BY cl.created_at DESC
    LIMIT 10
  `, [customerId]);

  const statusLabels: Record<string, string> = {
    new: '未着手',
    calling: '架電中',
    appointed: 'アポ獲得',
    contracted: '成約',
    ng: 'NG',
    unreachable: '不通',
  };

  const resultLabels: Record<string, string> = {
    unreachable: '不通',
    callback: '折り返し待ち',
    appointed: 'アポ獲得',
    ng: 'NG',
    other: 'その他',
  };

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/call-list" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} />
          リストに戻る
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Customer Info */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={24} />
                  {customer.company_name}
                </h1>
                <p style={{ color: 'var(--color-text-light)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} />
                  {customer.contact_name || '担当者未設定'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CustomerEditForm customer={customer} />
                <span className={`badge badge-${customer.status}`}>
                  {statusLabels[customer.status]}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <a
                  href={`tel:${customer.phone}`}
                  className="btn btn-primary btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Phone size={20} />
                  {customer.phone}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: customer.email ? 'var(--color-text-light)' : 'var(--color-text-muted)' }}>
                <Mail size={16} />
                {customer.email || 'メール未設定'}
              </div>
            </div>

            {customer.next_action_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <Clock size={16} style={{ color: 'var(--color-warning)' }} />
                次回アクション予定: {customer.next_action_date}
              </div>
            )}

            {customer.notes && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>メモ</h3>
                <p style={{ color: 'var(--color-text-light)', whiteSpace: 'pre-wrap' }}>{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Call History */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>架電履歴</h2>
            {callLogs.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)' }}>履歴はありません</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {callLogs.map((log) => (
                  <div key={log.id} style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className={`badge badge-${log.result === 'appointed' ? 'appointed' : log.result === 'ng' ? 'ng' : 'calling'}`}>
                        {resultLabels[log.result]}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {new Date(log.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {log.notes && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{log.notes}</p>
                    )}
                    {log.next_action_date && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                        次回: {log.next_action_date}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                      担当: {log.user_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call Result Form */}
        <div>
          <CallResultForm customerId={customerId} />
        </div>
      </div>
    </Layout>
  );
}

