import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({
                message: "Email and verification code are required",
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

        if (user.isVerified) {
            return NextResponse.json({
                message: "User is already verified",
                success: false
            }, { status: 400 });
        }

        // Check if verification code matches
        if (user.verificationCode !== code) {
            return NextResponse.json({
                message: "Invalid verification code",
                success: false
            }, { status: 400 });
        }

        // Check if verification code has expired
        if (new Date() > user.expiryDate) {
            return NextResponse.json({
                message: "Verification code has expired",
                success: false
            }, { status: 400 });
        }

        // Update user as verified
        user.isVerified = true;
        // Keep the verification code instead of clearing it
        await user.save();

        // Generate JWT token
        const token = generateToken({
            userId: (user._id as string).toString(),
            email: user.email,
            username: user.username,
            isVerified: true
        });

        // Create response with token as httpOnly cookie
        const response = NextResponse.json({
            message: "Email verified successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: true,
                isAccepting: user.isAccepting
            }
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error) {
        console.error("Error during email verification:", error);
        return NextResponse.json({
            message: "Error during email verification",
            success: false
        }, { status: 500 });
    }
}
