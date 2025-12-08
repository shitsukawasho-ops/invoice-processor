import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const data = await request.json();
        const {
            year,
            month,
            target_hires,
            cr_ap_rate,
            mtg_ap_rate,
            contract_mtg_rate,
            job_contract_rate,
            hire_job_rate,
            revenue_per_hire,
            cost_per_call,
            fixed_cost,
            variable_cost,
        } = data;

        // Upsert - insert or replace
        const { rows } = await pool.query(`
      INSERT INTO kpi_settings (
        year, month, target_hires, cr_ap_rate, mtg_ap_rate, 
        contract_mtg_rate, job_contract_rate, hire_job_rate,
        revenue_per_hire, cost_per_call, fixed_cost, variable_cost,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
      ON CONFLICT(year, month) DO UPDATE SET
        target_hires = EXCLUDED.target_hires,
        cr_ap_rate = EXCLUDED.cr_ap_rate,
        mtg_ap_rate = EXCLUDED.mtg_ap_rate,
        contract_mtg_rate = EXCLUDED.contract_mtg_rate,
        job_contract_rate = EXCLUDED.job_contract_rate,
        hire_job_rate = EXCLUDED.hire_job_rate,
        revenue_per_hire = EXCLUDED.revenue_per_hire,
        cost_per_call = EXCLUDED.cost_per_call,
        fixed_cost = EXCLUDED.fixed_cost,
        variable_cost = EXCLUDED.variable_cost,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
            year, month, target_hires, cr_ap_rate, mtg_ap_rate,
            contract_mtg_rate, job_contract_rate, hire_job_rate,
            revenue_per_hire, cost_per_call, fixed_cost, variable_cost
        ]);

        return NextResponse.json({ success: true, id: rows[0].id });
    } catch (error) {
        console.error('Error saving KPI settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || new Date().getFullYear();
        const month = searchParams.get('month') || new Date().getMonth() + 1;

        const { rows } = await pool.query(`
      SELECT * FROM kpi_settings WHERE year = $1 AND month = $2
    `, [year, month]);
        const settings = rows[0];

        if (!settings) {
            return NextResponse.json({
                year: Number(year),
                month: Number(month),
                target_hires: 33,
                cr_ap_rate: 1.0,
                mtg_ap_rate: 95.0,
                contract_mtg_rate: 50.0,
                job_contract_rate: 80.0,
                hire_job_rate: 80.0,
                revenue_per_hire: 70000,
                cost_per_call: 105,
                fixed_cost: 0,
                variable_cost: 0,
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching KPI settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
