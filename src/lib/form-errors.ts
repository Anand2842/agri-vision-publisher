import type { ZodError } from "zod";

const fieldMessages: Record<string, string> = {
  name: "Please enter your name",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  subject: "Please enter a subject",
  message: "Please enter a message (at least 10 characters)",
  title: "Please enter an article title",
  abstract: "Please enter an abstract (50–3000 characters)",
  category: "Please select a category",
  plan: "Please select a membership plan",
  password: "Please enter your password",
  confirmPassword: "Please confirm your password",
  receipt: "Please upload your payment receipt",
  transactionId: "Please enter your transaction reference number",
};

export function friendlyZodError(error: ZodError): string {
  const first = error.issues[0];
  if (!first) return "Please check your input";
  const field = first.path[0];
  if (typeof field === "string" && fieldMessages[field]) {
    return fieldMessages[field];
  }
  if (first.code === "too_small") return "This field is required";
  if (first.code === "invalid_string") return "Please enter a valid value";
  return "Please check your input";
}
