import { transporter } from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json({
                message: "Email is required",
                success: false
            }, { status: 400 });
        }

        // Send test email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Test Email - Nodemailer Setup",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; text-align: center;">Test Email Successful!</h2>
                    <p style="color: #666; font-size: 16px;">
                        Congratulations! Your Nodemailer setup is working correctly.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        This test email was sent to: <strong>${email}</strong>
                    </p>
                    <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                        <em>You can now delete this test email.</em>
                    </p>
                </div>
            `
        });

        return NextResponse.json({
            message: "Test email sent successfully",
            success: true
        }, { status: 200 });

    } catch (error) {
        console.error("Error sending test email:", error);
        return NextResponse.json({
            message: "Failed to send test email",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
