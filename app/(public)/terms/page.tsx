import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Yash Organics",
  description: "Terms and conditions of using Yash Organics.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 12, 2026</p>
          </div>
          
          <div className="prose prose-neutral mx-auto text-muted-foreground">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using Yash Organics, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <h3>2. Products and Services</h3>
            <p>
              All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.
            </p>
            <h3>3. Medical Disclaimer</h3>
            <p>
              The content on our website is for informational purposes only. Our products are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a healthcare professional before starting any new health or beauty regimen.
            </p>
            <h3>4. User Accounts</h3>
            <p>
              If you create an account on our website, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
