
import { supabase } from "../lib/supabaseClient";

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function submitDispute(formData, requestId) {
  if (!WEBHOOK_URL) {
    throw new Error("The n8n webhook URL is not configured.");
  }

  // Get the currently authenticated merchant session.
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const payload = new FormData();

  payload.append("request_id", requestId);
  payload.append("customer_email", formData.customerEmail.trim());
  payload.append("order_id", formData.orderId.trim());
  payload.append("issue_type", formData.issueType);
  payload.append("amount", formData.amount);
  payload.append("currency", "INR");
  payload.append("payment_method", formData.paymentMethod);
  payload.append(
    "transaction_reference",
    formData.transactionReference.trim()
  );
  payload.append("customer_details", formData.details.trim());
  payload.append("consent", String(formData.consent));
  payload.append("screenshot", formData.screenshot);

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: payload,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || "We could not process your submission."
    );
  }

  if (!result.success) {
    throw new Error(
      result.message || "Your submission could not be accepted."
    );
  }

  return result;
}
