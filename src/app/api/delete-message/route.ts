import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('messageId');

        if (!messageId) {
            return NextResponse.json({
                message: "Message ID is required",
                success: false
            }, { status: 400 });
        }

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

        // Find user and remove the message
        const user = await UserModel.findById(payload.userId);

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        // Find and remove the message
        const messageIndex = user.messages.findIndex(
            msg => msg._id?.toString() === messageId
        );

        if (messageIndex === -1) {
            return NextResponse.json({
                message: "Message not found",
                success: false
            }, { status: 404 });
        }

        user.messages.splice(messageIndex, 1);
        await user.save();

        return NextResponse.json({
            message: "Message deleted successfully",
            success: true
        }, { status: 200 });

    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json({
            message: "Error deleting message",
            success: false
        }, { status: 500 });
    }
}
