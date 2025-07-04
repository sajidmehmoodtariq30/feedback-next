import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

// This is a development-only endpoint to help with testing
export async function GET(request: Request) {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({
            message: "Not available in production",
            success: false
        }, { status: 404 });
    }

    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                message: "Email is required",
                success: false
            }, { status: 400 });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        return NextResponse.json({
            message: "Verification code retrieved",
            success: true,
            verificationCode: user.verificationCode,
            email: user.email,
            isVerified: user.isVerified
        }, { status: 200 });

    } catch (error) {
        console.error("Error getting verification code:", error);
        return NextResponse.json({
            message: "Error getting verification code",
            success: false
        }, { status: 500 });
    }
}
