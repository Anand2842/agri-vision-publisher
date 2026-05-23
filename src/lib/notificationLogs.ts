export interface EmailLog {
  id: string;
  timestamp: string;
  type: string;
  recipient: string;
  payload: string;
}

export function logSimulatedEmail(type: string, recipient: string, payload: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("system_email_logs");
    const logs: EmailLog[] = raw ? JSON.parse(raw) : [];
    const newLog: EmailLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      recipient,
      payload,
    };
    logs.unshift(newLog);
    // Keep only the last 30 logs
    localStorage.setItem("system_email_logs", JSON.stringify(logs.slice(0, 30)));
    
    // Output glowing, beautiful logs in developer console
    console.log(
      `%c[SYSTEM NOTIFICATION EVENT]%c Type: ${type} | To: ${recipient}\n\n${payload}`,
      "color: #ffffff; background: #0284c7; font-weight: bold; padding: 2px 4px; border-radius: 2px;",
      "color: #0f172a; font-weight: 500;"
    );
  } catch (err) {
    console.error("Failed to write simulated email log:", err);
  }
}

export function getSimulatedEmailLogs(): EmailLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("system_email_logs");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read simulated email logs:", err);
    return [];
  }
}

export function clearSimulatedEmailLogs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("system_email_logs");
}
