import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userFirstname: string;
  resetPasswordLink: string;
}

export const ResetPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Yash Organics password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
           <Text style={logoText}>YASH ORGANICS</Text>
        </Section>
        <Text style={paragraph}>Hi {userFirstname},</Text>
        <Text style={paragraph}>
          Someone recently requested a password change for your Yash Organics account. 
          If this was you, you can set a new password here:
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={resetPasswordLink}>
            Reset Password
          </Button>
        </Section>
        <Text style={paragraph}>
          If you don&apos;t want to change your password or didn&apos;t request this, just ignore and delete this message.
        </Text>
        <Text style={paragraph}>
          To keep your account secure, please don&apos;t forward this email to anyone.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Yash Organics | Pure. Organic. Handcrafted.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#fdfcf0",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const logoSection = {
  textAlign: "center" as const,
  padding: "30px 0",
};

const logoText = {
  fontSize: "24px",
  letterSpacing: "4px",
  fontWeight: "bold",
  color: "#1b3022",
  textTransform: "uppercase" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#444",
};

const btnContainer = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const button = {
  backgroundColor: "#1b3022",
  borderRadius: "3px",
  color: "#fdfcf0",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#e0e0e0",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  textAlign: "center" as const,
};
