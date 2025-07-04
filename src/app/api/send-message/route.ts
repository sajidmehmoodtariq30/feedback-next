import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, content } = await request.json();

        if (!username || !content) {
            return NextResponse.json({
                message: "Username and message content are required",
                success: false
            }, { status: 400 });
        }

        // Find the user to send message to
        const user = await UserModel.findOne({ 
            username: username.toLowerCase().trim() 
        });

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                success: false
            }, { status: 404 });
        }

        if (!user.isVerified) {
            return NextResponse.json({
                message: "User is not verified",
                success: false
            }, { status: 400 });
        }

        if (!user.isAccepting) {
            return NextResponse.json({
                message: "User is not accepting messages",
                success: false
            }, { status: 403 });
        }

        // Create new message
        const messageData = {
            content: content.trim(),
            createdAt: new Date()
        };

        // Add message to user's messages array using Mongoose create method
        // @ts-expect-error - Mongoose subdocument creation
        user.messages.push(messageData);
        await user.save();

        return NextResponse.json({
            message: "Message sent successfully",
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({
            message: "Error sending message",
            success: false
        }, { status: 500 });
    }
}
