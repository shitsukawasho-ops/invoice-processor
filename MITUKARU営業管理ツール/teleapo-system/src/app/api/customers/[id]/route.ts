import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);

    try {
        const body = await request.json();
        const { company_name, contact_name, phone, email, address, website, notes } = body;

        // Validate required fields
        if (!company_name || !phone) {
            return NextResponse.json(
                { error: 'Company name and phone are required' },
                { status: 400 }
            );
        }

        // Update customer
        await pool.query(`
      UPDATE customers
      SET company_name = $1,
          contact_name = $2,
          phone = $3,
          email = $4,
          address = $5,
          website = $6,
          notes = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [company_name, contact_name || '', phone, email || '', address || '', website || '', notes || '', customerId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);

    try {
        const { rows } = await pool.query(`
      SELECT * FROM customers WHERE id = $1
    `, [customerId]);
        const customer = rows[0];

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
}
