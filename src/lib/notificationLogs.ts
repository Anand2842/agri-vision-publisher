import { sendNotificationEmail } from "@/lib/email.functions";

// Sends an email via the server (see email.functions.ts). `recipient` is "editor",
// a user id, or an email address.
export function logSimulatedEmail(type: string, recipient: string, payload: string) {
  if (typeof window === "undefined") return;
  sendNotificationEmail({ data: { to: recipient, subject: type, body: payload } }).catch((err) =>
    console.error("Failed to send notification email:", err),
  );
}
