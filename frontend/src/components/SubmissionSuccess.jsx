
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default function SubmissionSuccess({ result, onReset }) {
  return (
    <div className="success-card">
      <div className="success-icon">
        <CheckCircle2 size={38} />
      </div>

      <span className="eyebrow">SUBMISSION RECEIVED</span>
      <h2>Your dispute has been submitted.</h2>

      <p className="success-description">
        Your case has been registered with ResolveAI. We will investigate
        the transaction and send updates to your registered email address.
      </p>

      <div className="case-reference">
        <span>YOUR CASE REFERENCE</span>
        <strong>{result?.case_number || "Pending confirmation"}</strong>
      </div>

      <div className="status-row">
        <span className="status-dot" />
        <div>
          <strong>Case received</strong>
          <span>
            {result?.status || "received"}
          </span>
        </div>
      </div>

      <div className="success-security">
        <ShieldCheck size={19} />
        Your submission has been recorded. Keep your case reference for
        future communication.
      </div>

      <button className="secondary-button" onClick={onReset}>
        Submit another dispute
        <ArrowRight size={17} />
      </button>
    </div>
  );
}
