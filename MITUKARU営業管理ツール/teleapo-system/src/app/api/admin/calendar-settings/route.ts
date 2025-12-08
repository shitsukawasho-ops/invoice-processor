import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import pool from '@/utils/db';

// Create settings table if not exists - Commented out for Neon migration, assume schema handled externally
// try {
//     db.exec(`...`);
// } catch (e) {
//     console.log('Table may already exist');
// }

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM calendar_settings WHERE id = 1');
        const settings = rows[0] as any;

        // Check if Google credentials are configured
        const googleConnected = !!(
            process.env.GOOGLE_CLIENT_ID &&
            process.env.GOOGLE_CLIENT_SECRET &&
            process.env.GOOGLE_REFRESH_TOKEN
        );

        if (settings) {
            return NextResponse.json({
                settings: {
                    googleCalendarId: settings.google_calendar_id || '',
                    googleConnected,
                    defaultMeetingDuration: settings.default_meeting_duration || 30,
                    businessHoursStart: settings.business_hours_start || '09:00',
                    businessHoursEnd: settings.business_hours_end || '18:00',
                    emailSubjectTemplate: settings.email_subject_template || '{company_name}様とのWeb会議のご案内',
                },
            });
        }

        return NextResponse.json({
            settings: {
                googleCalendarId: 'primary',
                googleConnected,
                defaultMeetingDuration: 30,
                businessHoursStart: '09:00',
                businessHoursEnd: '18:00',
                emailSubjectTemplate: '{company_name}様とのWeb会議のご案内',
            },
        });
    } catch (error) {
        console.error('Error fetching calendar settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const {
            googleCalendarId,
            defaultMeetingDuration,
            businessHoursStart,
            businessHoursEnd,
            emailSubjectTemplate,
        } = data;

        // Upsert settings
        await pool.query(`
            INSERT INTO calendar_settings (
                id, google_calendar_id, default_meeting_duration,
                business_hours_start, business_hours_end, email_subject_template,
                updated_at
            ) VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
                google_calendar_id = EXCLUDED.google_calendar_id,
                default_meeting_duration = EXCLUDED.default_meeting_duration,
                business_hours_start = EXCLUDED.business_hours_start,
                business_hours_end = EXCLUDED.business_hours_end,
                email_subject_template = EXCLUDED.email_subject_template,
                updated_at = CURRENT_TIMESTAMP
        `, [
            googleCalendarId || 'primary',
            defaultMeetingDuration || 30,
            businessHoursStart || '09:00',
            businessHoursEnd || '18:00',
            emailSubjectTemplate || '{company_name}様とのWeb会議のご案内'
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving calendar settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
