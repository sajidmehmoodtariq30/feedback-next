import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieHeader = request.headers.get('cookie');
    console.log('Test cookies - Raw cookie header:', cookieHeader);
    
    const cookies: Record<string, string> = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            cookies[name] = value;
        });
    }
    
    return NextResponse.json({
        message: "Cookie test",
        rawCookies: cookieHeader,
        parsedCookies: cookies,
        hasToken: !!cookies.token
    });
}
