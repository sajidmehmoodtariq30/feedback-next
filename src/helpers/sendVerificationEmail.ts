import { resend } from "@/lib/resend";
import VerificationEmail from "../../email/verification";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    otp: string
) : Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: email,
            subject: "Verify your email address",
            react: VerificationEmail({
                username: username,
                otp: otp
            }),
        })
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