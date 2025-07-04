import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({
                message: "Username is required",
                success: false
            }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await UserModel.findOne({ 
            username: username.toLowerCase().trim() 
        });

        const isUnique = !existingUser;

        return NextResponse.json({
            message: isUnique ? "Username is available" : "Username is already taken",
            success: true,
            isUnique
        }, { status: 200 });

    } catch (error) {
        console.error("Error checking username:", error);
        return NextResponse.json({
            message: "Error checking username availability",
            success: false
        }, { status: 500 });
    }
}
