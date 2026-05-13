import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns | Yash Organics",
  description: "Information about shipping policies, delivery times, and returns.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif">Shipping & Returns</h1>
          </div>
          
          <div className="prose prose-neutral mx-auto text-muted-foreground">
            <h3>Shipping Policy</h3>
            <p>
              We currently ship within India. All orders are processed within 1-2 business days.
              Standard shipping typically takes 3-5 business days depending on your location.
            </p>
            <p>
              We offer free standard shipping on all orders over ₹999. For orders under ₹999, a flat shipping rate will be calculated at checkout based on your pincode.
            </p>
            
            <h3>Order Tracking</h3>
            <p>
              Once your order ships, you will receive a confirmation email with tracking information.
              You can also track your order status by logging into your account and visiting the Orders section.
            </p>
            
            <h3>Returns & Refunds</h3>
            <p>
              Due to the nature of our organic and personal care products, we do not accept returns on opened items for hygiene reasons.
            </p>
            <p>
              If you receive a damaged or incorrect product, please contact us within 48 hours of delivery at support@yashorganics.com with photos of the item, and we will issue a replacement or refund immediately.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
