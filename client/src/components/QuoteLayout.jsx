import { PawPrint, Phone } from "lucide-react";
import "../styles/QuoteLayout.css";

function QuoteLayout({ children, activeStep = 1 }) {
  const steps = ["Pet Info", "Your Information", "Select Plan", "Checkout"];

  return (
    <div className="quote-page">
      <header className="quote-header">
        <div className="quote-logo">
          <PawPrint />
          <div>
            <h2>PetsBest</h2>
            <p>Pet Health Insurance</p>
          </div>
        </div>

        <div className="quote-phone">
          <Phone size={18} />
          <span>(800) 660-8726</span>
        </div>
      </header>

      <div className="quote-stepper">
        {steps.map((step, index) => (
          <div className="quote-step" key={step}>
            <span>{step}</span>
            <b className={activeStep >= index + 1 ? "active" : ""}></b>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}

export default QuoteLayout;