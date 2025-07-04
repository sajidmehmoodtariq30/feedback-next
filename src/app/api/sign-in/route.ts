import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { identifier, password } = await request.json();

        if (!identifier || !password) {
            return NextResponse.json({
                message: "Email/username and password are required",
                success: false
            }, { status: 400 });
        }

        // Find user by email or username
        const user = await UserModel.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        }).select('+password');

        if (!user) {
            return NextResponse.json({
                message: "Invalid credentials",
                success: false
            }, { status: 401 });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({
                message: "Invalid credentials",
                success: false
            }, { status: 401 });
        }

        // Generate JWT token
        const token = generateToken({
            userId: (user._id as string).toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified
        });

        console.log('Sign-in: Generated token for user:', user.username);

        // Create response with user data
        const response = NextResponse.json({
            message: "Sign in successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                isAccepting: user.isAccepting
            }
        }, { status: 200 });

        // Set token as httpOnly cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        console.log('Sign-in: Cookie set successfully for user:', user.username);

        return response;

    } catch (error) {
        console.error("Error during sign in:", error);
        return NextResponse.json({
            message: "Error during sign in",
            success: false
        }, { status: 500 });
    }
}
