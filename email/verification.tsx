import {
    Html,
    Head,
    Font,
    Preview,
    Heading,
    Row,
    Section,
    Text,
    Button
} from '@react-email/components';

interface VerificationEmailProps {
    username: string;
    otp: string;
}

export default function VerificationEmail({
    username,
    otp
}: VerificationEmailProps) {
    return (
        <Html lang="en" dir="ltr">
            <Head >
                <title>Verification Code</title>
            </Head>
            <Preview>Verify your email address</Preview>
            <Section style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <Heading style={{ textAlign: 'center' }}>Email Verification</Heading>
                <Text style={{ marginTop: '20px', fontSize: '16px' }}>
                    Hi {username},
                </Text>
                <Text style={{ marginTop: '10px', fontSize: '16px' }}>
                    Please use the following OTP to verify your email address:
                </Text>
                <Heading style={{ textAlign: 'center', fontSize: '24px', marginTop: '20px' }}>{otp}</Heading>
                <Button
                    href="https://your-verification-link.com"
                    style={{
                        display: 'block',
                        width: '200px',
                        margin: '20px auto',
                        backgroundColor: '#007bff',
                        color: '#ffffff',
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '10px 0',
                        borderRadius: '5px'
                    }}
                >
                    Verify Email
                </Button>
            </Section>
        </Html>
    );
}