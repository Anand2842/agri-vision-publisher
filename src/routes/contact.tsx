import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [
    { title: "Contact — Agripop" },
    { name: "description", content: "Reach the editorial office of Agripop." },
  ] }),
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(2000),
});

function Contact() {
  const [sending, setSending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const r = schema.safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(r.data);
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks — we'll be in touch.");
    form.reset();
  };
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="eyebrow">Contact</div>
            <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink leading-[1.05]">Editorial Office</h1>
            <p className="mt-6 text-foreground/75 leading-relaxed max-w-md">
              For author queries, advertising and general correspondence. Editorial decisions are typically returned within 21 days.
            </p>
            <ul className="mt-10 space-y-5 text-sm">
              <li className="flex gap-3"><Mail className="h-4 w-4 mt-1 text-primary" /> editor@agripop.org</li>
              <li className="flex gap-3"><Phone className="h-4 w-4 mt-1 text-primary" /> +91 11 2345 6789</li>
              <li className="flex gap-3"><MessageCircle className="h-4 w-4 mt-1 text-primary" /> WhatsApp: +91 98765 43210</li>
              <li className="flex gap-3"><MapPin className="h-4 w-4 mt-1 text-primary" /> Plot 14, Pusa Campus, New Delhi 110012, India</li>
            </ul>
            <div className="mt-10 eyebrow">Office Hours</div>
            <div className="text-sm mt-2">Mon–Fri · 09:30 to 18:00 IST</div>
          </div>
          <form onSubmit={onSubmit} className="md:col-span-7 bg-paper border border-rule p-8 md:p-10 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="name" label="Your name" />
              <Field name="email" label="Email" type="email" />
            </div>
            <Field name="subject" label="Subject" />
            <div>
              <label className="eyebrow block mb-2">Message</label>
              <textarea name="message" rows={8} required className="w-full bg-background border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
            </div>
            <button disabled={sending} className="bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm hover:bg-primary/90 disabled:opacity-60">
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input name={name} type={type} required className="w-full bg-background border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
    </div>
  );
}
