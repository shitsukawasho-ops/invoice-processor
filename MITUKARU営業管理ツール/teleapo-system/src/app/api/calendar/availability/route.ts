import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

// Default business hours slots
function generateDefaultSlots(date: string): { start: string; end: string; available: boolean }[] {
    const slots = [];
    const today = new Date();
    const targetDate = new Date(date);
    const isToday = targetDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();

    // Business hours: 9:00 - 18:00
    const hours = [9, 10, 11, 13, 14, 15, 16, 17];

    for (const hour of hours) {
        // Skip past hours if it's today
        if (isToday && hour <= currentHour) {
            continue;
        }

        slots.push({
            start: `${hour.toString().padStart(2, '0')}:00`,
            end: `${hour.toString().padStart(2, '0')}:30`,
            available: true,
        });
        slots.push({
            start: `${hour.toString().padStart(2, '0')}:30`,
            end: `${(hour + 1).toString().padStart(2, '0')}:00`,
            available: true,
        });
    }

    return slots;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        // TODO: Integrate with Google Calendar API
        // For now, return default slots
        // When Google Calendar is integrated:
        // 1. Fetch busy times from Google Calendar
        // 2. Mark those slots as unavailable

        const googleCalendarId = process.env.GOOGLE_CALENDAR_ID;

        if (googleCalendarId && process.env.GOOGLE_REFRESH_TOKEN) {
            // Google Calendar integration would go here
            // For now, return default slots with random availability
            const slots = generateDefaultSlots(date);

            // Simulate some busy slots
            const busySlots = new Set([1, 3, 5, 8].map(i => i));
            slots.forEach((slot, index) => {
                if (busySlots.has(index)) {
                    slot.available = false;
                }
            });

            return NextResponse.json({ slots, source: 'google' });
        }

        // Return all slots as available (no calendar integration)
        const slots = generateDefaultSlots(date);
        return NextResponse.json({ slots, source: 'default' });
    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
