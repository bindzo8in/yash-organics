import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ClientContactEmailProps {
  name: string;
}

export const ClientContactEmail = ({ name }: ClientContactEmailProps) => (
  <Html>
    <Head />
    <Preview>We've received your message - Yash Organics</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>Thank You for Reaching Out</Heading>
          <Text style={paragraph}>Dear {name},</Text>
          <Text style={paragraph}>
            Thank you for contacting Yash Organics. We have received your message
            and our team will get back to you as soon as possible (usually within
            24-48 hours).
          </Text>
          <Text style={paragraph}>
            In the meantime, feel free to browse our latest collection of premium
            organic products.
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            Warm regards,
            <br />
            <strong>The Yash Organics Team</strong>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © 2024 Yash Organics. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

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

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "40px",
};
