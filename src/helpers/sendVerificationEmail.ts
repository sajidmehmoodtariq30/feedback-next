import { transporter } from "@/lib/nodemailer";
import VerificationEmail from "../../email/verification";
import { ApiResponse } from "@/types/apiResponse";
import { renderEmailToHtml } from "./renderEmailToHtml";

export async function sendVerificationEmail(
    email: string,
    username: string,
    otp: string
) : Promise<ApiResponse>{
    try {
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email credentials not configured");
            return {
                status: 500,
                message: "Email service not configured",
                success: false
            };
        }

        // Render the React email component to HTML
        const emailHtml = await renderEmailToHtml(VerificationEmail({
            username: username,
            otp: otp
        }));

        // Send email using nodemailer
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email address",
            html: emailHtml,
        });

        return { success: true, status: 200, message: "Verification email sent successfully" };
    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            status: 500,
            message: "Failed to send verification email",
            success: false
        };
    }
}