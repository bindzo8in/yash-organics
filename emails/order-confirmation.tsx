import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
  userFirstname: string;
  orderId: string;
  totalAmount: number;
}

export const OrderConfirmationEmail = ({
  userFirstname,
  orderId,
  totalAmount,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Yash Organics Order Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
           <Text style={logoText}>YASH ORGANICS</Text>
        </Section>
        <Text style={paragraph}>Hi {userFirstname},</Text>
        <Text style={paragraph}>
          Thank you for your order! We have received your payment of ₹{totalAmount.toFixed(2)} for Order #{orderId.slice(-6).toUpperCase()}.
        </Text>
        <Text style={paragraph}>
          We are currently processing your order and will notify you once it has been shipped.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Yash Organics | Pure. Organic. Handcrafted.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

const main = {
  backgroundColor: "#fdfcf0",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "580px" };
const logoSection = { textAlign: "center" as const, padding: "30px 0" };
const logoText = { fontSize: "24px", letterSpacing: "4px", fontWeight: "bold", color: "#1b3022", textTransform: "uppercase" as const };
const paragraph = { fontSize: "16px", lineHeight: "26px", color: "#444" };
const hr = { borderColor: "#e0e0e0", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "1px", textAlign: "center" as const };
