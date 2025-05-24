'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function handleRequestSpace(formData: FormData) {
    try {
        const spaceId = formData.get('spaceId') as string;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const companyName = formData.get('companyName') as string;
        const requirements = formData.get('requirements') as string;

        if (!spaceId || !name || !email) {
            return { success: false, error: 'Missing required fields: spaceId, name, or email' };
        }

        // Fetch space details
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
        });

        if (!space || space.status !== 'AVAILABLE') {
            return { success: false, error: 'Space not found or not available' };
        }

        // Prepare email content
        const text = `New Space Request from ${name}

Client Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Company: ${companyName || 'Not provided'}
- Requirements: ${requirements || 'None specified'}

Space Details:
- Space: ${space.name || space.spaceCode}
- Type: ${space.type}
- Size: ${space.size} sq ft
- Rate: ₹${space.rate?.toFixed(2) || 'Not specified'}/month

Please review this request and contact the client for further details.`;
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Space Request</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    h2 { color: #1a73e8; }
                    h3 { color: #444; }
                    p { margin: 10px 0; }
                    .section { margin-bottom: 20px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>New Space Request from ${name}</h2>
                    <div class="section">
                        <h3>Client Details</h3>
                        <p><span class="label">Name:</span> ${name}</p>
                        <p><span class="label">Email:</span> ${email}</p>
                        <p><span class="label">Phone:</span> ${phone || 'Not provided'}</p>
                        <p><span class="label">Company:</span> ${companyName || 'Not provided'}</p>
                        <p><span class="label">Requirements:</span> ${requirements || 'None specified'}</p>
                    </div>
                    <div class="section">
                        <h3>Space Details</h3>
                        <p><span class="label">Space:</span> ${space.name || space.spaceCode}</p>
                        <p><span class="label">Type:</span> ${space.type}</p>
                        <p><span class="label">Size:</span> ${space.size} sq ft</p>
                        <p><span class="label">Rate:</span> ₹${space.rate?.toFixed(2) || 'Not specified'}/month</p>
                    </div>
                    <p>Please review this request and contact the client for further details.</p>
                </div>
            </body>
            </html>
        `;

        // Send email to admin
        const emailResult = await sendEmail({
            to: process.env.ADMIN_EMAIL || 'subhamsahu4789@gmail.com',
            subject: `New Space Request: ${space.name || space.spaceCode}`,
            text,
            html,
        });

        if (!emailResult.success) {
            return { success: false, error: `Failed to send email: ${emailResult.error}` };
        }

        // Revalidate the spaces page
        revalidatePath('/dashboard/spaces');

        return { success: true, message: 'Space request submitted and email sent to admin' };
    } catch (error) {
        console.error('Error in handleRequestSpace:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to process space request' };
    }
}