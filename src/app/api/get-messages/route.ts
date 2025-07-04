import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    try {
        // Get token from cookies
        const cookieHeader = request.headers.get('cookie');
        const token = cookieHeader?.split(';')
            .find(c => c.trim().startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            return NextResponse.json({
                message: "Authentication required",
                success: false
            }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({
                message: "Invalid token",
                success: false
            }, { status: 401 });
        }

        // Find user and get their messages
        const user = await UserModel.findById(payload.userId);

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        // Sort messages by creation date (newest first)
        const sortedMessages = user.messages.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            message: "Messages retrieved successfully",
            success: true,
            messages: sortedMessages
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({
            message: "Error fetching messages",
            success: false
        }, { status: 500 });
    }
}
