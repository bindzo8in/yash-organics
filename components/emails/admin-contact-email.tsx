import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AdminContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export const AdminContactEmail = ({
  name,
  email,
  message,
}: AdminContactEmailProps) => (
  <Html>
    <Head />
    <Preview>New Inquiry from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={h1}>New Contact Inquiry</Heading>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={paragraph}>
            <strong>Email:</strong> {email}
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Message:</strong>
          </Text>
          <Text style={messageText}>{message}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            This email was sent from the Yash Organics contact form.
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

const messageText = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  backgroundColor: "#f9f9f9",
  padding: "15px",
  borderRadius: "4px",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  marginTop: "40px",
};
