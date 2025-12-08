import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

interface User {
    id: number;
    name: string;
    daily_quota: number;
}

interface AssignmentResult {
    userId: number;
    userName: string;
    quota: number;
    alreadyAssigned: number;
    newlyAssigned: number;
}

export async function POST() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        // Get all active users with their quotas (exclude admins from assignment)
        const { rows: users } = await pool.query<User>(`
      SELECT id, name, daily_quota FROM users 
      WHERE role = 'user'
      ORDER BY id ASC
    `);

        if (users.length === 0) {
            return NextResponse.json({
                success: false,
                message: '割り当て対象のユーザーがいません',
                results: []
            });
        }

        // Get unassigned customers (not contracted, not NG, no assigned user)
        const { rows: unassignedCustomers } = await pool.query<{ id: number }>(`
      SELECT id FROM customers 
      WHERE assigned_to IS NULL 
      AND status NOT IN ('contracted', 'ng')
      ORDER BY RANDOM()
    `);

        const results: AssignmentResult[] = [];
        let customerIndex = 0;

        for (const user of users) {
            // Count how many customers already assigned to this user for today
            const { rows: alreadyAssignedRows } = await pool.query<{ count: number }>(`
        SELECT COUNT(*)::int as count FROM customers 
        WHERE assigned_to = $1
        AND status NOT IN ('contracted', 'ng')
        AND (next_action_date = $2 OR next_action_date IS NULL)
      `, [user.id, today]);
            const alreadyAssigned = alreadyAssignedRows[0];

            const remainingQuota = Math.max(0, user.daily_quota - alreadyAssigned.count);
            let newlyAssigned = 0;

            // Assign customers up to the remaining quota
            while (newlyAssigned < remainingQuota && customerIndex < unassignedCustomers.length) {
                const customer = unassignedCustomers[customerIndex];
                await pool.query(`
          UPDATE customers 
          SET assigned_to = $1, next_action_date = $2, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $3
        `, [user.id, today, customer.id]);
                newlyAssigned++;
                customerIndex++;
            }

            results.push({
                userId: user.id,
                userName: user.name,
                quota: user.daily_quota,
                alreadyAssigned: alreadyAssigned.count,
                newlyAssigned: newlyAssigned,
            });
        }

        const totalAssigned = results.reduce((sum, r) => sum + r.newlyAssigned, 0);
        const remainingUnassigned = unassignedCustomers.length - customerIndex;

        return NextResponse.json({
            success: true,
            message: `${totalAssigned}件のリストを割り当てました`,
            totalAssigned,
            remainingUnassigned,
            results
        });
    } catch (error) {
        console.error('Assignment error:', error);
        return NextResponse.json({
            success: false,
            message: '割り当て処理中にエラーが発生しました',
            error: String(error)
        }, { status: 500 });
    }
}

// GET: Get current assignment status
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        // Get assignment stats for each user
        const { rows: stats } = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.daily_quota,
        COUNT(CASE WHEN c.assigned_to = u.id AND c.status NOT IN ('contracted', 'ng') THEN 1 END)::int as assigned_count,
        COUNT(CASE WHEN c.assigned_to = u.id AND c.next_action_date = $1 THEN 1 END)::int as today_count
      FROM users u
      LEFT JOIN customers c ON c.assigned_to = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.id ASC
    `, [today]);

        // Count unassigned customers
        const { rows: unassignedRows } = await pool.query<{ count: number }>(`
      SELECT COUNT(*)::int as count FROM customers 
      WHERE assigned_to IS NULL 
      AND status NOT IN ('contracted', 'ng')
    `);
        const unassigned = unassignedRows[0];

        return NextResponse.json({
            users: stats,
            unassignedCount: unassigned.count
        });
    } catch (error) {
        console.error('Error fetching assignment stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
