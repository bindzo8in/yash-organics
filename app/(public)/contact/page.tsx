import { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Yash Organics",
  description: "Get in touch with the Yash Organics team for any inquiries or support.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FDFBF7] pt-48 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-bold">Reach Out</span>
          <h1 className="text-6xl md:text-8xl font-serif text-primary">Contact Us</h1>
          <p className="text-muted-foreground text-lg font-light tracking-wide italic max-w-2xl mx-auto">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-16 items-start">
          <div className="md:col-span-2 space-y-12">
            <div>
              <h3 className="text-3xl font-serif mb-8 text-primary">Get in Touch</h3>
              <div className="space-y-8 text-muted-foreground">
                <div className="group">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 opacity-50">Email</p>
                  <p className="text-foreground font-serif text-xl group-hover:text-primary transition-colors cursor-pointer">support@yashorganics.com</p>
                </div>
                <div className="group">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 opacity-50">Phone</p>
                  <p className="text-foreground font-serif text-xl group-hover:text-primary transition-colors cursor-pointer">+91 97901 84439</p>
                  <p className="text-xs tracking-widest mt-1">MON-FRI, 9AM - 6PM IST</p>
                </div>
                <div className="group">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 opacity-50">Headquarters</p>
                  <p className="text-foreground leading-relaxed">
                    East Tambaram,<br/>
                    Chennai - 600 059<br/>
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
