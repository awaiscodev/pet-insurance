import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuoteLayout from "../components/QuoteLayout";
import "../styles/PersonalInfo.css";
import api from "../api";

function PersonalInfo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const petInfo = JSON.parse(localStorage.getItem("petInfo"));

    if (petInfo) {
      setForm((oldForm) => ({
        ...oldForm,
        zipCode: petInfo.zipCode || "",
        phone: petInfo.phone || "",
        email: petInfo.email || "",
      }));
    }
  }, []);

  const updateField = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const required = [
      "firstName",
      "lastName",
      "address",
      "city",
      "state",
      "zipCode",
      "phone",
      "email",
    ];

    const empty = required.find((item) => !form[item]);

    if (empty) {
      alert("Please complete all required fields before continuing.");
      return;
    }

    try {
      await api.post("/personal-info", form);
      localStorage.setItem("personalInfo", JSON.stringify(form));
      navigate("/select-plan");
    } catch (error) {
      alert("Personal info save failed. Backend check karo.");
    }
  };

  return (
    <QuoteLayout activeStep={2}>
      <main className="personal-wrap">
        <form className="personal-card" onSubmit={handleNext}>
          <h1>Your Information</h1>
          <p>Your quote details are saved. Please complete your contact information.</p>

          <div className="personal-grid">
            <div>
              <label>First Name*</label>
              <input
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="First name"
              />
            </div>

            <div>
              <label>Last Name*</label>
              <input
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <label>Physical Address*</label>
          <input
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Street address"
          />

          <div className="personal-grid">
            <div>
              <label>Apt / Unit</label>
              <input
                value={form.apartment}
                onChange={(e) => updateField("apartment", e.target.value)}
                placeholder="Apartment number"
              />
            </div>

            <div>
              <label>Zip Code*</label>
              <input
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
                placeholder="Zip code"
              />
            </div>
          </div>

          <div className="personal-grid">
            <div>
              <label>City*</label>
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
              />
            </div>

            <div>
              <label>State*</label>
              <input
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          <div className="personal-grid">
            <div>
              <label>Phone Number*</label>
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label>Email*</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>

          <button className="primary-quote-btn" type="submit">
            Continue to Plans
          </button>
        </form>
      </main>
    </QuoteLayout>
  );
}

export default PersonalInfo;