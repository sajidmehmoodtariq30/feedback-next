import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({
            message: "Signed out successfully",
            success: true
        }, { status: 200 });

        // Clear the token cookie
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0 // Expire immediately
        });

        return response;

    } catch (error) {
        console.error("Error during sign out:", error);
        return NextResponse.json({
            message: "Error during sign out",
            success: false
        }, { status: 500 });
    }
}
