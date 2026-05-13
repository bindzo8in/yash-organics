import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Yash Organics",
  description: "Our privacy policy and how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 12, 2026</p>
          </div>
          
          <div className="prose prose-neutral mx-auto text-muted-foreground">
            <p>
              At Yash Organics, we respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
            <h3>1. The data we collect about you</h3>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              Identity Data, Contact Data, Financial Data, Transaction Data, Technical Data, Profile Data, and Usage Data.
            </p>
            <h3>2. How we use your personal data</h3>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to process your orders, manage your account, and provide customer support.
            </p>
            <h3>3. Data Security</h3>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
              All payment transactions are encrypted using SSL technology and processed via secure third-party payment gateways (Razorpay).
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
