import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Mail, Phone, Calendar, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

function AdminMessages() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Failed to load messages: ${error.message}`);
      return;
    }
    setMessages(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error(`Failed to delete message: ${error.message}`);
      return;
    }

    toast.success("Message deleted successfully");
    if (expandedId === id) setExpandedId(null);
    load();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Contact Messages</h2>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Review and manage enquiries sent to the Editorial Office contact form.
      </p>

      <div className="border border-rule">
        {messages === null ? (
          <div className="p-10 text-center text-muted-foreground">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No messages found.</div>
        ) : (
          <div className="divide-y divide-rule bg-paper">
            {messages.map((m) => {
              const isExpanded = expandedId === m.id;
              const dateStr = new Date(m.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div key={m.id} className="transition-colors hover:bg-secondary/10">
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleExpand(m.id)}
                    className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base text-ink font-semibold">{m.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {dateStr}
                        </span>
                      </div>
                      <div className="text-sm text-foreground/80 font-medium truncate">
                        {m.subject}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <button
                        onClick={(e) => remove(m.id, e)}
                        className="p-2 text-foreground/45 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="text-foreground/40">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-rule/50 bg-secondary/5 space-y-4 text-sm animate-fade-in">
                      <div className="grid sm:grid-cols-2 gap-4 text-xs font-sans text-muted-foreground border-b border-rule/30 pb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground/70">Email:</span>
                          <a href={`mailto:${m.email}`} className="underline text-primary hover:text-primary/80 font-semibold">
                            {m.email}
                          </a>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none text-ink leading-relaxed whitespace-pre-wrap font-sans p-4 border border-rule/30 rounded bg-background">
                        {m.message}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
