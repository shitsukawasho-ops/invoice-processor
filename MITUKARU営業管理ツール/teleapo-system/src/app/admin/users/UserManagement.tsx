'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, KeyRound, UserCog, RefreshCw, Users } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  daily_quota: number;
  created_at: string;
}

interface AssignmentStats {
  users: Array<{
    id: number;
    name: string;
    daily_quota: number;
    assigned_count: number;
    today_count: number;
  }>;
  unassignedCount: number;
}

interface UserManagementProps {
  initialUsers: User[];
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<string | null>(null);
  const [editingQuota, setEditingQuota] = useState<{ id: number; value: number } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
    daily_quota: 50,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setFormData({ email: '', name: '', password: '', role: 'user', daily_quota: 50 });
        setShowForm(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('このユーザーを削除しますか？')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('新しいパスワードを入力してください:');
    if (!newPassword) return;

    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      alert('パスワードをリセットしました');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleQuotaChange = async (userId: number, newQuota: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_quota: newQuota }),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, daily_quota: newQuota } : u));
        setEditingQuota(null);
      }
    } catch (error) {
      console.error('Error updating quota:', error);
    }
  };

  const handleAssign = async () => {
    if (!confirm('未割当のリストを各ユーザーに割り当てますか？')) return;

    setAssigning(true);
    setAssignmentResult(null);

    try {
      const response = await fetch('/api/assign', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const details = data.results
          .filter((r: { newlyAssigned: number }) => r.newlyAssigned > 0)
          .map((r: { userName: string; newlyAssigned: number }) => `${r.userName}: ${r.newlyAssigned}件`)
          .join('、');

        setAssignmentResult(
          `✅ ${data.totalAssigned}件を割り当てました。${details ? `(${details})` : ''} 残り未割当: ${data.remainingUnassigned}件`
        );
      } else {
        setAssignmentResult(`❌ ${data.message}`);
      }

      router.refresh();
    } catch (error) {
      console.error('Error assigning:', error);
      setAssignmentResult('❌ 割り当て処理中にエラーが発生しました');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          新規ユーザー作成
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleAssign}
          disabled={assigning}
        >
          <RefreshCw size={16} className={assigning ? 'spin' : ''} />
          {assigning ? '割り当て中...' : 'リストを割り当て'}
        </button>
      </div>

      {assignmentResult && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: assignmentResult.startsWith('✅') ? '#d1fae5' : '#fee2e2',
            border: 'none'
          }}
        >
          {assignmentResult}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>新規ユーザー作成</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">名前</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">メールアドレス</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">パスワード</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">権限</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">一般ユーザー</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">1日の割当数</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.daily_quota}
                  onChange={(e) => setFormData({ ...formData, daily_quota: parseInt(e.target.value) || 50 })}
                  min="1"
                  max="500"
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '作成中...' : '作成'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>名前</th>
                <th>メールアドレス</th>
                <th>権限</th>
                <th>1日の割当数</th>
                <th>作成日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCog size={16} style={{ opacity: 0.6 }} />
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-appointed' : 'badge-new'}`}>
                      {user.role === 'admin' ? '管理者' : '一般'}
                    </span>
                  </td>
                  <td>
                    {editingQuota?.id === user.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                          value={editingQuota.value}
                          onChange={(e) => setEditingQuota({ id: user.id, value: parseInt(e.target.value) || 0 })}
                          min="1"
                          max="500"
                          autoFocus
                        />
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleQuotaChange(user.id, editingQuota.value)}
                        >
                          保存
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingQuota(null)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{
                          cursor: user.role !== 'admin' ? 'pointer' : 'default',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: user.role !== 'admin' ? 'var(--color-bg-secondary)' : 'transparent'
                        }}
                        onClick={() => {
                          if (user.role !== 'admin') {
                            setEditingQuota({ id: user.id, value: user.daily_quota || 50 });
                          }
                        }}
                        title={user.role !== 'admin' ? 'クリックして編集' : ''}
                      >
                        {user.role === 'admin' ? '-' : `${user.daily_quota || 50}件`}
                      </span>
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ja-JP')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleResetPassword(user.id)}
                        title="パスワードリセット"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        title="削除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
