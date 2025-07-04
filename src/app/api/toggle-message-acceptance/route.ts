import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { isAccepting } = await request.json();

        if (typeof isAccepting !== 'boolean') {
            return NextResponse.json({
                message: "isAccepting must be a boolean value",
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

        // Update user's message acceptance status
        const user = await UserModel.findByIdAndUpdate(
            payload.userId,
            { isAccepting },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        return NextResponse.json({
            message: `Message acceptance ${isAccepting ? 'enabled' : 'disabled'} successfully`,
            success: true,
            isAccepting: user.isAccepting
        }, { status: 200 });

    } catch (error) {
        console.error("Error toggling message acceptance:", error);
        return NextResponse.json({
            message: "Error updating message acceptance settings",
            success: false
        }, { status: 500 });
    }
}
