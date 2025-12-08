import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import pool from '@/utils/db';
import UserManagement from './UserManagement';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  daily_quota: number;
  created_at: string;
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const { rows: users } = await pool.query<User>(`
    SELECT id, email, name, role, daily_quota, created_at FROM users ORDER BY id ASC
  `);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">ユーザー管理</h1>
        <p className="page-subtitle">アカウントの作成・編集・削除</p>
      </div>

      <UserManagement initialUsers={users} />
    </Layout>
  );
}
