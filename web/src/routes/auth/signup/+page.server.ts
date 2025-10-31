import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true',
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
});

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, code: string, name: string) {
    try {
        await transporter.sendMail({
            from: env.SMTP_FROM || 'noreply@100xhackathon.com',
            to: email,
            subject: 'Your Verification Code',
            html: `
				<h2>Hi ${name},</h2>
				<p>Your verification code is:</p>
				<h1 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">${code}</h1>
				<p>This code will expire in 10 minutes.</p>
				<p>If you didn't request this code, please ignore this email.</p>
			`
        });
        return true;
    } catch (err) {
        console.error('Email send failed:', err);
        return false;
    }
}

export const actions = {
    register: async ({ request, locals }) => {
        const data = await request.formData();
        const citizenshipId = data.get('citizenshipId')?.toString();
        const voterCardId = data.get('voterCardId')?.toString();
        const email = data.get('email')?.toString();

        if (!citizenshipId || !voterCardId || !email) {
            return fail(400, { error: 'All fields required' });
        }

        // Check if user exists in mock_already_registered
        try {
            const record = await locals.pb.collection('mock_already_registered').getFirstListItem(
                `citizen_id="${citizenshipId}"`
            );

            if (!record) {
                return fail(404, { error: 'Citizenship ID not found' });
            }

            // Generate OTP
            const code = generateCode();

            // Update the record with OTP
            await locals.pb.collection('mock_already_registered').update(record.id, {
                otp: parseInt(code)
            });

            // Send email
            const sent = await sendOTPEmail(record.mail, code, record.full_name);

            if (!sent) {
                return fail(500, { error: 'Failed to send verification email' });
            }

            return { success: true, email: record.mail };

        } catch (err) {
            console.error('Registration error:', err);
            return fail(500, { error: 'Registration failed' });
        }
    },

    verify: async ({ request, locals }) => {
        const data = await request.formData();
        const code = data.get('code')?.toString();

        if (!code) {
            return fail(400, { verifyError: 'Code required' });
        }

        try {
            // Find user with matching OTP
            const record = await locals.pb.collection('mock_already_registered').getFirstListItem(
                `otp=${parseInt(code)}`
            );

            if (!record) {
                return fail(400, { verifyError: 'Invalid code' });
            }

            // TODO: Create record in actual registered collection
            // await locals.pb.collection('registered').create({
            //   citizen_id: record.citizen_id,
            //   full_name: record.full_name,
            //   mail: record.mail,
            //   ...
            // });

            // Clear OTP
            await locals.pb.collection('mock_already_registered').update(record.id, {
                otp: null
            });

            return { verified: true };

        } catch (err) {
            console.error('Verification error:', err);
            return fail(400, { verifyError: 'Invalid or expired code' });
        }
    }
} satisfies Actions;
