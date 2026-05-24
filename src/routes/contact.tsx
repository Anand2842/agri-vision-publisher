import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Mail, Phone, MapPin, Building2, Megaphone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/contact")({
  component: Contact,
  loader: () => fetchSeoMetadata("contact"),
  head: ({ loaderData }) => ({
    title: loaderData?.title || "Contact — The Agriculture Popular Article Magazine",
    meta: loaderData
      ? [
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [],
  }),
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(8).max(20),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(2000),
});

function Contact() {
  const { get } = useSiteContent("contact");
  const [sending, setSending] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setSending(true);
    const payload = {
      name: r.data.name,
      email: r.data.email,
      subject: r.data.subject,
      message: `[Phone: ${r.data.phone}]\n\n${r.data.message}`,
    };
    const { error } = await supabase.from("contact_messages").insert(payload);
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
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
            <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink leading-[1.05]">
              Editorial Office
            </h1>
            <p className="mt-6 text-foreground/75 leading-relaxed max-w-md">
              For author queries, membership, advertising and general correspondence. {get("office", "turnaround")}
            </p>

            <div className="mt-10">
              <div className="eyebrow">Chief Editor</div>
              <div className="font-display text-xl mt-2">{get("office", "chief_editor")}</div>
              <div className="text-sm text-foreground/70 mt-1">
                {get("office", "chief_editor_title")}
              </div>
            </div>

            <ul className="mt-8 space-y-5 text-sm">
              <li className="flex gap-3">
                <Mail className="h-4 w-4 mt-1 text-primary shrink-0" />{" "}
                <a className="underline" href={`mailto:${get("office", "email")}`}>
                  {get("office", "email")}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "phone")}
              </li>
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "address")}
              </li>
            </ul>
            <div className="mt-10 eyebrow">Office Hours</div>
            <div className="text-sm mt-2">{get("office", "hours")}</div>
          </div>

          <form
            onSubmit={onSubmit}
            className="md:col-span-7 bg-paper border border-rule p-8 md:p-10 space-y-5 h-fit"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="name" label="Your name" />
              <Field name="email" label="Email" type="email" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="phone" label="Phone number" type="tel" />
              <Field name="subject" label="Subject" />
            </div>
            <div>
              <label className="text-sm font-sans font-medium block mb-2">Message</label>
              <textarea
                name="message"
                rows={8}
                required
                className="w-full bg-background border border-rule px-4 py-3 min-h-[140px] rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <button
              disabled={sending}
              className="bg-primary text-primary-foreground h-12 px-6 rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center w-max"
            >
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <div className="border border-rule bg-paper p-8">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div className="eyebrow">Publisher</div>
            </div>
            <h3 className="font-display text-2xl mt-3 leading-tight">
              {get("publisher", "name")}
            </h3>
            <p className="text-sm text-foreground/70 mt-3 leading-relaxed">(R.A.D.F.)</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("publisher", "address")}
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "phone")}
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "email")}
              </li>
            </ul>
          </div>

          <div className="border border-rule bg-paper p-8">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <div className="eyebrow">Advertise With Us</div>
            </div>
            <h3 className="font-display text-2xl mt-3 leading-tight">
              {get("advertise", "heading")}
            </h3>
            <p className="text-sm text-foreground/75 mt-3 leading-relaxed">
              {get("advertise", "body")}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-3">
                <Mail className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "email")}
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 mt-1 text-primary shrink-0" /> {get("office", "phone")}
              </li>
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label className="text-sm font-sans font-medium block mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required
        className="w-full h-12 bg-background border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
