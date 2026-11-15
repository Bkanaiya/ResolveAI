const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateDispute(formData) {
  const errors = {};

  const email = formData.customerEmail.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customerEmail = "Enter a valid email address.";
  }

  if (!formData.orderId.trim()) {
    errors.orderId = "Order ID is required.";
  }

  if (!formData.issueType) {
    errors.issueType = "Select an issue type.";
  }

  const amount = Number(formData.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Enter a valid payment amount.";
  }

  if (!formData.paymentMethod) {
    errors.paymentMethod = "Select a payment method.";
  }

  if (formData.details.trim().length < 20) {
    errors.details = "Provide at least 20 characters of explanation.";
  }

  if (!formData.screenshot) {
    errors.screenshot = "Upload payment evidence.";
  } else {
    if (!ALLOWED_FILE_TYPES.includes(formData.screenshot.type)) {
      errors.screenshot = "Upload a JPG, PNG, WEBP or PDF file.";
    }

    if (formData.screenshot.size > MAX_FILE_SIZE) {
      errors.screenshot = "File size must not exceed 10 MB.";
    }
  }

  if (!formData.consent) {
    errors.consent = "Consent is required to submit this case.";
  }

  return errors;
}