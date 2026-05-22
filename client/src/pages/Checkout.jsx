import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, BadgeCheck } from "lucide-react";
import QuoteLayout from "../components/QuoteLayout";
import "../styles/Checkout.css";
import api from "../api";

function Checkout() {
  const navigate = useNavigate();

  const [petInfo, setPetInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    billingZip: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pet = JSON.parse(localStorage.getItem("petInfo"));
    const person = JSON.parse(localStorage.getItem("personalInfo"));
    const plan = JSON.parse(localStorage.getItem("selectedPlan"));

    setPetInfo(pet);
    setPersonalInfo(person);
    setSelectedPlan(plan);
  }, []);

  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length === 0) return "";

    let month = digits.slice(0, 2);
    let year = digits.slice(2, 4);

    if (month.length === 1 && Number(month) > 1) {
      month = `0${month}`;
    }

    if (month.length === 2) {
      const monthNumber = Number(month);
      if (monthNumber < 1 || monthNumber > 12) {
        return payment.expiry;
      }
    }

    if (year.length > 0) {
      const yearNumber = Number(year);

      if (year.length === 1 && yearNumber !== 2 && yearNumber !== 3) {
        return payment.expiry;
      }

      if (year.length === 2 && (yearNumber < 26 || yearNumber > 36)) {
        return payment.expiry;
      }
    }

    if (digits.length <= 2) return month;
    return `${month} / ${year}`;
  };

  const updatePayment = (name, value) => {
    setPayment({ ...payment, [name]: value });
    setErrors((old) => ({ ...old, [name]: "" }));
  };

  const validateExpiry = () => {
    const digits = payment.expiry.replace(/\D/g, "");

    if (digits.length < 4) return false;

    const month = Number(digits.slice(0, 2));
    const year = Number(digits.slice(2, 4));

    if (month < 1 || month > 12) return false;
    if (year < 26 || year > 36) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = Number(String(now.getFullYear()).slice(2));

    if (year < currentYear) return false;
    if (year === currentYear && month <= currentMonth) return false;

    return true;
  };

  if (!selectedPlan) {
    return (
      <QuoteLayout activeStep={4}>
        <div className="checkout-empty">Please select a plan first.</div>
      </QuoteLayout>
    );
  }

  const isPromo = selectedPlan.id === "promo";
  const totalToday = selectedPlan.price;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const required = ["cardName", "cardNumber", "expiry", "cvc", "billingZip"];

    required.forEach((item) => {
      if (!payment[item]) {
        newErrors[item] = "Required";
      }
    });

    if (payment.cardNumber.replace(/\D/g, "").length < 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!validateExpiry()) {
      newErrors.expiry = "Invalid expiry date";
    }

    if (payment.billingZip && payment.billingZip.replace(/\D/g, "").length < 6) {
      newErrors.billingZip = "Billing zip must be 6 digits";
    }

    if (!payment.agree) {
      newErrors.agree = "Required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      setTimeout(async () => {
        await api.post("/payment", {
          petName: petInfo?.petName || "",
          customerName: `${personalInfo?.firstName || ""} ${personalInfo?.lastName || ""}`,
          email: petInfo?.email || "",
          planName: selectedPlan.name,
          amount: totalToday.toFixed(2),
          status: "Payment Received",
          cardName: payment.cardName,
          billingZip: payment.billingZip,
        });

        localStorage.setItem(
          "paymentResult",
          JSON.stringify({
            status: "received",
            amount: totalToday,
            planName: selectedPlan.name,
          })
        );

        navigate("/success");
      }, 5000);
    } catch (error) {
      setLoading(false);
      setErrors({ submit: "Payment save failed. Backend check karo." });
    }
  };

  return (
    <QuoteLayout activeStep={4}>
      {loading && (
        <div className="page-loader">
          <div className="loader-box">
            <div className="loader-spinner"></div>
            <p>Fetching...</p>
          </div>
        </div>
      )}

      <main className="checkout-wrap">
        <form className="payment-card" onSubmit={handleSubmit}>
          <h1>Checkout</h1>
          <p>Complete your enrollment securely using card payment.</p>

          <div className="secure-box">
            <Lock size={18} />
            <span>Secure checkout powered by encrypted payment form.</span>
          </div>

          <h2>Payment Information</h2>

          <div className="card-only">
            <CreditCard size={22} />
            <span>Card Payment</span>
          </div>

          <label>Name on Card*</label>
          <input
            className={errors.cardName ? "input-error" : ""}
            value={payment.cardName}
            onChange={(e) => updatePayment("cardName", e.target.value)}
            placeholder="Card holder name"
          />

          <label>Card Number*</label>
          <input
            className={errors.cardNumber ? "input-error" : ""}
            value={payment.cardNumber}
            onChange={(e) =>
              updatePayment("cardNumber", formatCardNumber(e.target.value))
            }
            placeholder="1234 1234 1234 1234"
          />

          <div className="payment-grid">
            <div>
              <label>Expiry Date*</label>
              <input
                className={errors.expiry ? "input-error" : ""}
                value={payment.expiry}
                onChange={(e) =>
                  updatePayment("expiry", formatExpiry(e.target.value))
                }
                placeholder="MM / YY"
              />
            </div>

            <div>
              <label>Security Code*</label>
              <input
                className={errors.cvc ? "input-error" : ""}
                value={payment.cvc}
                maxLength={4}
                onChange={(e) =>
                  updatePayment("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="CVC"
              />
            </div>
          </div>

          <label>Billing Zip*</label>
          <input
            className={errors.billingZip ? "input-error" : ""}
            value={payment.billingZip}
            maxLength={6}
            onChange={(e) =>
              updatePayment(
                "billingZip",
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="Zip code"
          />

          <label className={errors.agree ? "check-row check-error" : "check-row"}>
            <input
              type="checkbox"
              checked={payment.agree}
              onChange={(e) => updatePayment("agree", e.target.checked)}
            />
            <span>I agree to the terms and policy conditions.</span>
          </label>

          {errors.cardNumber && <p className="field-error-text">{errors.cardNumber}</p>}
          {errors.expiry && <p className="field-error-text">{errors.expiry}</p>}
          {errors.billingZip && <p className="field-error-text">{errors.billingZip}</p>}
          {errors.submit && <p className="field-error-text">{errors.submit}</p>}

          <button className="pay-btn" type="submit" disabled={loading}>
            {isPromo ? "Activate Free Promo Plan" : "Pay $0.99 & Activate Plan"}
          </button>
        </form>

        <aside className="summary-card">
          <h2>Plan Summary</h2>

          <div className="pet-summary">
            <strong>{petInfo?.petName || "Pet"}</strong>
            <span>
              {petInfo?.age}, {petInfo?.petSex}, {petInfo?.breed}
            </span>
          </div>

          <div className={isPromo ? "summary-plan promo-summary" : "summary-plan paid-summary"}>
            <h3>{selectedPlan.name}</h3>
            <p>{selectedPlan.description}</p>
          </div>

          <ul className="summary-features">
            {selectedPlan.features.map((feature) => (
              <li key={feature}>
                <BadgeCheck size={17} />
                {feature}
              </li>
            ))}
          </ul>

          <div className="price-lines">
            <div>
              <span>Total Due Today</span>
              <b>${totalToday.toFixed(2)}</b>
            </div>
          </div>
        </aside>
      </main>
    </QuoteLayout>
  );
}

export default Checkout;