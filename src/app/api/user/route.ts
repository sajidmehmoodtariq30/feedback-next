import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    try {
        // Get token from cookies
        const cookieHeader = request.headers.get('cookie');
        console.log('API/user: Cookie header:', cookieHeader);
        
        let token = null;
        if (cookieHeader) {
            const cookies = cookieHeader.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'token') {
                    token = value;
                    break;
                }
            }
        }

        console.log('API/user: Extracted token:', token ? 'Token exists' : 'No token found');

        if (!token) {
            console.log('API/user: No token provided');
            return NextResponse.json({
                message: "Authentication required",
                success: false
            }, { status: 401 });
        }

        const payload = verifyToken(token);
        console.log('API/user: Token verification result:', payload ? 'Valid' : 'Invalid');
        
        if (!payload) {
            console.log('API/user: Invalid token');
            return NextResponse.json({
                message: "Invalid token",
                success: false
            }, { status: 401 });
        }

        // Find user
        const user = await UserModel.findById(payload.userId);

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        return NextResponse.json({
            message: "User data retrieved successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                isAccepting: user.isAccepting,
                messageCount: user.messages.length
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({
            message: "Error fetching user data",
            success: false
        }, { status: 500 });
    }
}
