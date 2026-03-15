/**
 * Email Utility Module
 * Handles sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'ahmadkhasimiri@gmail.com',
        pass: process.env.EMAIL_PASS || 'wwxh fqwv nmco tdrm'
    }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * Verify SMTP connection
 */
async function verifyConnection() {
    try {
        await transporter.verify();
        console.log('SMTP connection established successfully');
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error);
        return false;
    }
}

// Verify connection on startup
verifyConnection();

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 */
async function sendVerificationEmail(email, token) {
    const verificationUrl = `http://localhost:3000/verify?token=${token}`;
    
    const mailOptions = {
        from: {
            name: 'Verification System',
            address: EMAIL_CONFIG.auth.user
        },
        to: email,
        subject: 'Verify Your Email Address - Ahmouy System',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background: #0a0a0f; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="100%" style="max-width: 500px; background: linear-gradient(135deg, rgba(0, 255, 170, 0.05), rgba(0, 200, 255, 0.05)); border: 1px solid rgba(0, 255, 170, 0.2); border-radius: 20px; padding: 50px 40px;">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #00ffaa, #00c8ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0;">Verify Your Email</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; text-align: center; margin: 0;">
                                            Thank you for registering! Click the button below to verify your email address and activate your account.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #00ffaa, #00c8ff); color: #0a0a0f; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                            Verify Email
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="border-top: 1px solid rgba(0, 255, 170, 0.1); padding-top: 30px;">
                                        <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin: 0;">
                                            If the button doesn't work, copy and paste this URL into your browser:
                                        </p>
                                        <p style="color: #00ffaa; font-size: 12px; word-break: break-all; text-align: center; margin: 10px 0 0 0;">
                                            ${verificationUrl}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 30px;">
                                        <p style="color: #475569; font-size: 12px; text-align: center; margin: 0;">
                                            This link will expire after verification. If you didn't create an account, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `
Verify Your Email Address

Thank you for registering! Please verify your email address by clicking the link below:

 ${verificationUrl}

If you didn't create an account, please ignore this email.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw new Error('Failed to send verification email');
    }
}

/**
 * Resend verification email
 * @param {string} email - User's email address
 * @param {string} token - New verification token
 */
async function resendVerificationEmail(email, token) {
    return sendVerificationEmail(email, token);
}

module.exports = {
    sendVerificationEmail,
    resendVerificationEmail,
    verifyConnection
};