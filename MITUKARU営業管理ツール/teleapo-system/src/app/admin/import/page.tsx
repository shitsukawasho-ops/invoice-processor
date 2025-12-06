import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Layout from '@/components/Layout';
import ImportForm from './ImportForm';

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">リストインポート</h1>
        <p className="page-subtitle">CSVファイルから顧客リストを一括登録</p>
      </div>
      
      <ImportForm />
    </Layout>
  );
}
