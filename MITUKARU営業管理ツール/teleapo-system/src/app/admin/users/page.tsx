import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/components/Layout';
import db from '@/lib/db';
import UserManagement from './UserManagement';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const users = db.prepare(`
    SELECT id, email, name, role, created_at FROM users ORDER BY id ASC
  `).all() as User[];

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
