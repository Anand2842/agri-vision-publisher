import { createFileRoute } from "@tanstack/react-router";
import { QueueConsole } from "@/components/moderator/QueueConsole";
import { getSimulatedEmailLogs, clearSimulatedEmailLogs, EmailLog } from "@/lib/notificationLogs";
import { useEffect, useState } from "react";
import { Mail, Trash2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/queue")({
  component: AdminQueue,
});

function AdminQueue() {
  const [logs, setLogs] = useState<EmailLog[]>([]);

  useEffect(() => {
    setLogs(getSimulatedEmailLogs());
    // Poll logs every 2 seconds to make sure it is updated immediately on verification claims approval
    const t = setInterval(() => {
      setLogs(getSimulatedEmailLogs());
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const handleClear = () => {
    clearSimulatedEmailLogs();
    setLogs([]);
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Editorial Queue</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review submissions, move them between statuses, and leave editorial notes for authors.
            No catalog edits.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <QueueConsole />
      </div>

      {/* Internal Notification Log */}
      <div className="mt-10 border border-primary/20 bg-paper p-6 sm:p-8 rounded-sm">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg text-ink font-bold">Internal Notification Log</h3>
            </div>
          </div>
          {logs.length > 0 && (
            <button 
              onClick={handleClear}
              className="text-[10px] uppercase font-bold text-foreground/50 hover:text-destructive transition-colors font-sans flex items-center gap-1 border border-rule px-2.5 py-1.5 bg-background hover:bg-stone-50"
            >
              <Trash2 className="h-3 w-3" /> Clear Logs
            </button>
          )}
        </div>
        <p className="text-xs text-foreground/75 leading-relaxed mb-6 font-sans">
          This panel logs automated system alerts and notification events triggered by payment claim submissions and status updates. This is utilized for internal auditing and debugging prior to dispatching live emails via Resend.
        </p>

        {logs.length === 0 ? (
          <div className="border border-dashed border-rule bg-background py-8 text-center text-xs text-muted-foreground rounded-sm font-mono flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/60" />
            <span>No notification events recorded in this session yet. Submit a payment claim or approve one to monitor logs.</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="border border-rule bg-background p-4 rounded-sm hover-lift font-sans text-xs">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="font-semibold text-primary font-mono text-[11px] bg-primary/5 px-2 py-0.5 border border-primary/10 rounded-sm">
                      {log.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-2">To: <span className="font-semibold text-ink">{log.recipient}</span></span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-3 h-px bg-rule/50" />
                <pre className="mt-3 whitespace-pre-wrap font-mono text-[10px] text-foreground/80 leading-relaxed bg-stone-50 p-3 rounded-sm border border-rule/30 max-w-full overflow-x-auto select-text">
                  {log.payload}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
