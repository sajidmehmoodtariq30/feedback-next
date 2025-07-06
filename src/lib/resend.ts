import nodemailer from 'nodemailer';

// Create a transporter object using Gmail SMTP
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify the connection configuration
transporter.verify(function(error: any, success: any) {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

