import { MessageCircle } from "lucide-react";
import { useGlobalSiteContent } from "@/hooks/useSiteContent";

export function WhatsAppButton() {
  const { getHeader } = useGlobalSiteContent();
  const rawPhone = getHeader("topbar", "phone") || "9509164410";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const phoneFormatted = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

  return (
    <aside aria-label="Quick Support" className="print:hidden fixed bottom-6 right-6 z-40 flex items-center group">
      <a
        href={`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(
          "Hello, I have a query regarding The Agriculture Popular Article Magazine."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <MessageCircle className="h-5 w-5 fill-white stroke-none" />
        <span className="text-xs font-semibold uppercase tracking-wider font-sans pr-0.5 hidden sm:inline-block">
          Chat with us
        </span>
      </a>
    </aside>
  );
}
