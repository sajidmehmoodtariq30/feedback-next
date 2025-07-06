import nodemailer from 'nodemailer';

// Create a transporter object using the specified email service
export const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST, // Optional: for custom SMTP servers
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Only verify connection if we have credentials (to avoid build-time errors)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify(function(error: Error | null) {
        if (error) {
            console.log('Email configuration error:', error);
        } else {
            console.log('Email server is ready to send messages');
        }
    });
} else {
    console.log('Email credentials not configured - email sending will be disabled');
}

