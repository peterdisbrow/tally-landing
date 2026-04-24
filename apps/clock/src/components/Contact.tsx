import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          type: "contact",
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      });

      if (error) throw error;

      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error("Send error:", err);
      toast({ title: "Failed to send", description: "Please try again or email us directly.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-display text-xs tracking-[0.3em] text-primary uppercase">
            Get In Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 text-foreground">
            CONTACT US
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
          <p className="text-muted-foreground mt-6 max-w-lg mx-auto">
            Ready to elevate your broadcast? Let's talk about your next project.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <div className="flex items-start gap-4">
              <Mail className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-display text-sm tracking-wider text-foreground uppercase mb-1">
                  Email
                </h4>
                <p className="text-muted-foreground text-sm">info@disbrowproductions.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-display text-sm tracking-wider text-foreground uppercase mb-1">
                  Phone
                </h4>
                <p className="text-muted-foreground text-sm">Contact us for details</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-display text-sm tracking-wider text-foreground uppercase mb-1">
                  Location
                </h4>
                <p className="text-muted-foreground text-sm">Serving clients nationwide</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 flex flex-col gap-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-card border border-border text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-card border border-border text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <textarea
              placeholder="Tell us about your project..."
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-card border border-border text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-8 py-3.5 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 self-start glow-red disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sending ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
