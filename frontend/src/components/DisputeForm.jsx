
import { useRef, useState } from "react";
import { Upload, FileText, X, LoaderCircle, ShieldCheck } from "lucide-react";
import { submitDispute } from "../services/disputeService";
import { validateDispute } from "../utils/validators";

const INITIAL_FORM = {
  customerEmail: "",
  orderId: "",
  issueType: "",
  amount: "",
  paymentMethod: "",
  transactionReference: "",
  details: "",
  screenshot: null,
  consent: false,
};

export default function DisputeForm({ onSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const requestId = useRef(null);
  const fileInputRef = useRef(null);

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
    requestId.current = null;
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    updateField("screenshot", file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateDispute(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");

    if (!requestId.current) {
      requestId.current = crypto.randomUUID();
    }

    try {
      const result = await submitDispute(formData, requestId.current);
      onSuccess(result);
    } catch (error) {
      setServerError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function removeFile() {
    updateField("screenshot", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form className="dispute-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <div>
          <span className="eyebrow">PAYMENT SUPPORT</span>
          <h2>Submit a payment dispute</h2>
          <p>
            Tell us what happened. ResolveAI will investigate your payment
            using transaction evidence.
          </p>
        </div>
        <div className="secure-indicator">
          <ShieldCheck size={17} />
          <span>Secure submission</span>
        </div>
      </div>

      <div className="form-section">
        <h3>01. Your details</h3>

        <div className="form-grid">
          <div className="form-field full-width">
            <label htmlFor="customerEmail">Email address *</label>
            <input
              id="customerEmail"
              type="email"
              placeholder="you@example.com"
              value={formData.customerEmail}
              onChange={(e) =>
                updateField("customerEmail", e.target.value)
              }
            />
            {errors.customerEmail && (
              <span className="field-error">{errors.customerEmail}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="orderId">Order ID *</label>
            <input
              id="orderId"
              type="text"
              placeholder="e.g. ORD-1001"
              value={formData.orderId}
              onChange={(e) => updateField("orderId", e.target.value)}
            />
            {errors.orderId && (
              <span className="field-error">{errors.orderId}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="amount">Payment amount (INR) *</label>
            <div className="input-with-prefix">
              <span>₹</span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="850.00"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
              />
            </div>
            {errors.amount && (
              <span className="field-error">{errors.amount}</span>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>02. Payment information</h3>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="issueType">What went wrong? *</label>
            <select
              id="issueType"
              value={formData.issueType}
              onChange={(e) => updateField("issueType", e.target.value)}
            >
              <option value="">Select an issue</option>
              <option value="paid_not_ordered">
                Money deducted, order not confirmed
              </option>
              <option value="duplicate_payment">Duplicate payment</option>
              <option value="refund_not_received">Refund not received</option>
              <option value="incorrect_amount">Incorrect amount charged</option>
              <option value="other">Other payment issue</option>
            </select>
            {errors.issueType && (
              <span className="field-error">{errors.issueType}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="paymentMethod">Payment method *</label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) =>
                updateField("paymentMethod", e.target.value)
              }
            >
              <option value="">Select payment method</option>
              <option value="upi">UPI</option>
              <option value="card">Debit / Credit card</option>
              <option value="netbanking">Net banking</option>
              <option value="wallet">Wallet</option>
              <option value="other">Other</option>
            </select>
            {errors.paymentMethod && (
              <span className="field-error">{errors.paymentMethod}</span>
            )}
          </div>

          <div className="form-field full-width">
            <label htmlFor="transactionReference">
              Transaction reference / UTR
              <span className="optional-label">OPTIONAL</span>
            </label>
            <input
              id="transactionReference"
              type="text"
              placeholder="Enter your UTR or transaction ID"
              value={formData.transactionReference}
              onChange={(e) =>
                updateField("transactionReference", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>03. Explain the issue</h3>

        <div className="form-field">
          <label htmlFor="details">What happened? *</label>
          <textarea
            id="details"
            rows="4"
            placeholder="Describe when you made the payment, what happened afterward, and what resolution you expect..."
            value={formData.details}
            onChange={(e) => updateField("details", e.target.value)}
          />
          <div className="field-meta">
            {formData.details.length} characters (minimum 20)
          </div>
          {errors.details && (
            <span className="field-error">{errors.details}</span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>04. Upload supporting evidence</h3>

        <div
          className={`upload-zone ${formData.screenshot ? "has-file" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            hidden
          />

          {formData.screenshot ? (
            <div className="selected-file">
              <FileText size={24} />
              <div>
                <strong>{formData.screenshot.name}</strong>
                <span>
                  {(formData.screenshot.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                aria-label="Remove uploaded file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={25} />
              <strong>Click to upload payment evidence</strong>
              <span>JPG, PNG, WEBP or PDF · Maximum 10 MB</span>
            </>
          )}
        </div>

        {errors.screenshot && (
          <span className="field-error">{errors.screenshot}</span>
        )}

        <p className="upload-note">
          Upload a transaction receipt or payment screenshot. Never upload
          your UPI PIN, CVV, OTP, or full card credentials.
        </p>
      </div>

      <div className="consent-section">
        <label className="consent-label">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => updateField("consent", e.target.checked)}
          />
          <span>
            I confirm that the information provided is accurate and authorize
            the investigation of this payment dispute.
          </span>
        </label>
        {errors.consent && (
          <span className="field-error">{errors.consent}</span>
        )}
      </div>

      {serverError && (
        <div className="server-error" role="alert">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        className="submit-button"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <LoaderCircle size={18} className="spin" />
            Submitting dispute...
          </>
        ) : (
          "Submit payment dispute"
        )}
      </button>

      <p className="form-footer">
        Your evidence is used to investigate this case and is handled securely.
      </p>
    </form>
  );
}
