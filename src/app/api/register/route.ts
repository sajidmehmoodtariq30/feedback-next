import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/db";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, username, password } = await request.json();

        // Check if user already exists
        const existingUserbyUsername = await UserModel.findOne(
            {
                email,
                isVerified: true
            });
        if (existingUserbyUsername) {
            return Response.json({
                message: "User already exists",
                success: false
            }, { status: 400 });
        }
        const existingUserbyEmail = await UserModel.findOne({ email });
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit numeric code
        if (existingUserbyEmail) {
            if (existingUserbyEmail.isVerified) {
                return Response.json({
                    message: "User already exists",
                    success: false
                }, { status: 400 });
            }
            // Update existing user with new verification code and expiry date
            else{
                const hashedPassword = await bcrypt.hash(password,10);
                existingUserbyEmail.password = hashedPassword;
                existingUserbyEmail.verificationCode = verificationCode;
                existingUserbyEmail.expiryDate = new Date(Date.now() + 3600000);
                await existingUserbyEmail.save();
            }
         }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date
            const newUser = new UserModel({
                username,
                email,
                verificationCode,
                expiryDate: expiryDate,
                password: hashedPassword,
                isAccepting: true,
                isVerified: false,
                messages: []
            });
            await newUser.save();
        }
        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verificationCode);

        if (!emailResponse.success) {
            return Response.json({
                message: emailResponse.message,
                success: false
            }, { status: 500 });
        }

        return Response.json({
            message: "User registered successfully. Please check your email for verification.",
            success: true
        }, { status: 201 });
    } catch (error) {
        console.error("Error during registration:", error);
        return Response.json({
            message: "Error during registration",
            success: false
        }, { status: 500 });
    }
}