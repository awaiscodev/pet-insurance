import { useEffect, useState } from "react";
import { CheckCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import QuoteLayout from "../components/QuoteLayout";
import "../styles/Success.css";

function Success() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    setResult(JSON.parse(localStorage.getItem("paymentResult")));
  }, []);

  return (
    <QuoteLayout activeStep={4}>
      <main className="success-wrap">
        <section className="success-card">
          <CheckCircle className="success-icon" />

          <h1>Payment Received</h1>
          <p>
            Your <b>{result?.planName || "pet insurance plan"}</b> has been
            activated successfully.
          </p>

          <div className="success-amount">
            Total Paid Today: <strong>${Number(result?.amount || 0).toFixed(2)}</strong>
          </div>

          <Link to="/" className="home-btn">
            <Home size={18} />
            Back to Home
          </Link>
        </section>
      </main>
    </QuoteLayout>
  );
}

export default Success;