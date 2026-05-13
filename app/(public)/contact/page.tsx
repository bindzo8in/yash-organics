import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Yash Organics",
  description: "Get in touch with the Yash Organics team for any inquiries or support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">Reach Out</span>
            <h1 className="text-5xl md:text-7xl font-serif">Contact Us</h1>
            <p className="text-muted-foreground text-lg">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-serif mb-6">Get in Touch</h3>
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <p className="font-bold text-foreground">Email</p>
                  <p>support@yashorganics.com</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">Phone</p>
                  <p>+91 98765 43210</p>
                  <p className="text-sm">Mon-Fri, 9am - 6pm IST</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">Headquarters</p>
                  <p>123 Organic Lane, Green Valley<br/>Mumbai, Maharashtra 400001<br/>India</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 border border-border/50">
              <form className="space-y-6" action="#">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold uppercase tracking-widest">Name</label>
                  <input type="text" id="name" className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest">Email</label>
                  <input type="email" id="email" className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent" placeholder="Your email" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest">Message</label>
                  <textarea id="message" rows={4} className="w-full border-b border-border py-2 focus:outline-none focus:border-primary bg-transparent resize-none" placeholder="How can we help you?" required></textarea>
                </div>
                <Button type="button" className="w-full h-12 bg-primary rounded-none">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
