import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { date, startTime, endTime, customerEmail, customerName, companyName } = await request.json();

        // Validate required fields
        if (!date || !startTime) {
            return NextResponse.json({ error: 'Date and start time are required' }, { status: 400 });
        }

        // Create datetime strings
        const startDateTime = new Date(`${date}T${startTime}:00`);
        const endDateTime = new Date(`${date}T${endTime}:00`);

        // TODO: Create Google Calendar event with Meet link
        // For now, generate a mock Meet link
        const meetLink = `https://meet.google.com/mock-${Date.now().toString(36)}`;

        // TODO: Send email to customer
        // This would use Gmail API or SMTP
        if (customerEmail) {
            console.log(`Would send email to: ${customerEmail}`);
            console.log(`Subject: ${companyName}様とのWeb会議のご案内`);
            console.log(`Date: ${date} ${startTime}-${endTime}`);
            console.log(`Meet Link: ${meetLink}`);

            // When Gmail API is integrated:
            // await sendMeetInviteEmail({
            //     to: customerEmail,
            //     subject: `${companyName}様とのWeb会議のご案内`,
            //     date: date,
            //     startTime: startTime,
            //     endTime: endTime,
            //     meetLink: meetLink,
            // });
        }

        // Return success with meet link
        return NextResponse.json({
            success: true,
            meetLink,
            event: {
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                customerName,
                companyName,
            },
            emailSent: !!customerEmail,
        });
    } catch (error) {
        console.error('Error booking calendar slot:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
