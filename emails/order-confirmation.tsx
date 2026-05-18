import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Heading,
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
           <Text style={tagline}>Pure. Organic. Handcrafted.</Text>
        </Section>
        <Section style={contentSection}>
          <Heading style={heading}>Order Confirmed</Heading>
          <Text style={paragraph}>Hi {userFirstname},</Text>
          <Text style={paragraph}>
            Thank you for shopping with us! Your order <strong>#{orderId.slice(-6).toUpperCase()}</strong> has been successfully placed. We've received your payment of <strong>₹{totalAmount.toFixed(2)}</strong>.
          </Text>
          
          <div style={orderSummaryBox}>
            <Text style={summaryLabel}>ORDER NUMBER</Text>
            <Text style={summaryValue}>#{orderId.slice(-6).toUpperCase()}</Text>
            <Text style={summaryLabel}>TOTAL AMOUNT</Text>
            <Text style={summaryValue}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={summaryLabel}>PAYMENT STATUS</Text>
            <Text style={summaryValue}>PAID</Text>
          </div>

          <Text style={paragraph}>
            We are currently carefully preparing your organic products. You will receive another notification as soon as your order ships.
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          © {new Date().getFullYear()} Yash Organics. All rights reserved.
        </Text>
        <Text style={footerLinks}>
          <a href="#" style={link}>Visit Store</a> • <a href="#" style={link}>Contact Support</a>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = { margin: "40px auto", padding: "0", maxWidth: "600px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" };
const logoSection = { textAlign: "center" as const, padding: "40px 20px", backgroundColor: "#1b3022" };
const logoText = { fontSize: "28px", letterSpacing: "6px", fontWeight: "bold", color: "#ffffff", textTransform: "uppercase" as const, margin: "0" };
const tagline = { fontSize: "12px", letterSpacing: "2px", color: "#a7f3d0", textTransform: "uppercase" as const, margin: "10px 0 0 0" };
const contentSection = { padding: "40px 40px 20px" };
const heading = { fontSize: "24px", color: "#111827", margin: "0 0 20px", fontWeight: "600" };
const paragraph = { fontSize: "16px", lineHeight: "26px", color: "#4b5563", margin: "0 0 20px" };
const orderSummaryBox = { backgroundColor: "#f3f4f6", padding: "24px", borderRadius: "8px", margin: "30px 0" };
const summaryLabel = { fontSize: "11px", letterSpacing: "1px", color: "#6b7280", textTransform: "uppercase" as const, margin: "0 0 4px" };
const summaryValue = { fontSize: "16px", color: "#111827", fontWeight: "600", margin: "0 0 16px" };
const hr = { borderColor: "#e5e7eb", margin: "0" };
const footer = { color: "#9ca3af", fontSize: "13px", textAlign: "center" as const, padding: "30px 20px 5px", margin: "0" };
const footerLinks = { textAlign: "center" as const, padding: "0 20px 30px" };
const link = { color: "#1b3022", textDecoration: "underline", fontSize: "13px", fontWeight: "500" };
