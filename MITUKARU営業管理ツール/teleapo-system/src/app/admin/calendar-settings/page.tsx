import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/auth';
import Layout from '@/components/Layout';
import CalendarSettingsClient from './CalendarSettingsClient';

export default async function CalendarSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">カレンダー連携設定</h1>
                    <p className="page-subtitle">Googleカレンダー・Meet・メール通知の設定</p>
                </div>
            </div>

            <CalendarSettingsClient />
        </Layout>
    );
}
