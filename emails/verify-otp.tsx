import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyOtpEmailProps {
  userFirstname: string;
  otp: string;
}

export const VerifyOtpEmail = ({
  userFirstname,
  otp,
}: VerifyOtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Verification Code for Yash Organics</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Verify your email address</Heading>
          <Text style={paragraph}>Hi {userFirstname},</Text>
          <Text style={paragraph}>
            Welcome to Yash Organics! Please enter the following 6-digit code to verify your email address and complete your registration.
          </Text>
          <Section style={otpContainer}>
            <Text style={otpText}>{otp}</Text>
          </Section>
          <Text style={paragraph}>
            This code will expire in 10 minutes. If you did not request this, please ignore this email.
          </Text>
          <Text style={paragraph}>
            Thanks,
            <br />
            The Yash Organics Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyOtpEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  padding: "0 48px",
};

const otpContainer = {
  background: "#f4f4f4",
  borderRadius: "4px",
  margin: "16px 48px",
  padding: "12px",
};

const otpText = {
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "8px",
  textAlign: "center" as const,
  margin: "0",
  color: "#3A4D39",
};
