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

  useEffect(() => {
    const pet = JSON.parse(localStorage.getItem("petInfo"));
    const person = JSON.parse(localStorage.getItem("personalInfo"));
    const plan = JSON.parse(localStorage.getItem("selectedPlan"));

    setPetInfo(pet);
    setPersonalInfo(person);
    setSelectedPlan(plan);

    if (person?.zipCode) {
      setPayment((old) => ({ ...old, billingZip: person.zipCode }));
    }
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
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  };

  const updatePayment = (name, value) => {
    setPayment({ ...payment, [name]: value });
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

    const required = ["cardName", "cardNumber", "expiry", "cvc", "billingZip"];
    const empty = required.find((item) => !payment[item]);

    if (empty || !payment.agree) {
      alert("Please complete payment details and accept terms.");
      return;
    }

    try {
      await api.post("/payment", {
        petName: petInfo?.petName || "",
        customerName: `${personalInfo?.firstName || ""} ${personalInfo?.lastName || ""}`,
        email: personalInfo?.email || petInfo?.email || "",
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
    } catch (error) {
      alert("Payment save failed. Backend check karo.");
    }
  };

  return (
    <QuoteLayout activeStep={4}>
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
            value={payment.cardName}
            onChange={(e) => updatePayment("cardName", e.target.value)}
            placeholder="Card holder name"
          />

          <label>Card Number*</label>
          <input
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
                value={payment.expiry}
                onChange={(e) => updatePayment("expiry", formatExpiry(e.target.value))}
                placeholder="MM / YY"
              />
            </div>

            <div>
              <label>Security Code*</label>
              <input
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

          <label className="check-row">
            <input
              type="checkbox"
              checked={payment.agree}
              onChange={(e) => updatePayment("agree", e.target.checked)}
            />
            <span>I agree to the terms and policy conditions.</span>
          </label>

          <button className="pay-btn" type="submit">
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