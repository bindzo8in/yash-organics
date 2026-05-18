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

interface AdminOrderNotificationEmailProps {
  orderId: string;
  type: "NEW_ORDER" | "ORDER_CANCELLED";
  totalAmount: number;
  customerName: string;
}

export const AdminOrderNotificationEmail = ({
  orderId,
  type,
  totalAmount,
  customerName,
}: AdminOrderNotificationEmailProps) => {
  const isNewOrder = type === "NEW_ORDER";
  const title = isNewOrder ? "New Order Received!" : "Order Cancelled";
  const previewText = isNewOrder 
    ? `New order #${orderId.slice(-6).toUpperCase()} from ${customerName}`
    : `Order #${orderId.slice(-6).toUpperCase()} was cancelled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>YASH ORGANICS ADMIN</Text>
          </Section>
          <Text style={header(isNewOrder)}>{title}</Text>
          <Text style={paragraph}>Hello Admin,</Text>
          <Text style={paragraph}>
            {isNewOrder ? (
              <>
                A new order has been placed by <strong>{customerName}</strong>. 
                Payment of ₹{totalAmount.toFixed(2)} has been successfully received for Order <strong>#{orderId.slice(-6).toUpperCase()}</strong>.
              </>
            ) : (
              <>
                Order <strong>#{orderId.slice(-6).toUpperCase()}</strong> placed by <strong>{customerName}</strong> has been cancelled. 
                The total amount of ₹{totalAmount.toFixed(2)} is pending review/refund.
              </>
            )}
          </Text>
          <Text style={paragraph}>
            Please check the admin dashboard for full details.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Yash Organics System Notification
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminOrderNotificationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = { backgroundColor: "#ffffff", border: "1px solid #e6ebf1", borderRadius: "8px", margin: "40px auto", padding: "40px 20px", maxWidth: "600px" };
const logoSection = { textAlign: "center" as const, paddingBottom: "20px" };
const logoText = { fontSize: "20px", letterSpacing: "2px", fontWeight: "bold", color: "#1b3022", textTransform: "uppercase" as const };
const header = (isNewOrder: boolean) => ({ fontSize: "24px", color: isNewOrder ? "#10b981" : "#ef4444", textAlign: "center" as const, margin: "0 0 20px 0" });
const paragraph = { fontSize: "16px", lineHeight: "26px", color: "#444" };
const hr = { borderColor: "#e0e0e0", margin: "20px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textTransform: "uppercase" as const, letterSpacing: "1px", textAlign: "center" as const };
