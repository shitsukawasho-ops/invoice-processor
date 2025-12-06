'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle } from 'lucide-react';

interface CallResultFormProps {
  customerId: number;
}

export default function CallResultForm({ customerId }: CallResultFormProps) {
  const router = useRouter();
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
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
      console.error('Error saving call log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ position: 'sticky', top: '1rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>架電結果入力</h2>
      
      {success && (
        <div style={{ 
          background: '#d1fae5', 
          color: '#065f46', 
          padding: '0.75rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} />
          保存しました
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">結果 *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {[
              { value: 'unreachable', label: '不通' },
              { value: 'callback', label: '折り返し' },
              { value: 'appointed', label: 'アポ獲得' },
              { value: 'ng', label: 'NG' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setResult(option.value)}
                className={`btn ${result === option.value ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'center' }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">次回アクション日</label>
          <input
            type="date"
            className="form-input"
            value={nextActionDate}
            onChange={(e) => setNextActionDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">会話ログ・メモ</label>
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
    </div>
  );
}
