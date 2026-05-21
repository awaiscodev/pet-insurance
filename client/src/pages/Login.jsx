import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Login.css";
import api from "../api";

function Login() {
  const navigate = useNavigate();
  const [isCreate, setIsCreate] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateField = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreate) {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.password ||
        !form.confirmPassword
      ) {
        alert("Please fill all fields.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        alert("Password and confirm password do not match.");
        return;
      }

      try {
        await api.post("/register", {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        });

        localStorage.setItem(
          "userAccount",
          JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
          })
        );

        setIsCreate(false);
      } catch (error) {
  alert(error.response?.data?.message || error.message);
}

      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("userAccount"));

    if (!savedUser) {
      alert("No account found. Please create an account first.");
      setIsCreate(true);
      return;
    }

    if (form.email !== savedUser.email || form.password !== savedUser.password) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>{isCreate ? "Create Account" : "Login to Your Account"}</h1>

          <p>
            {isCreate
              ? "Create your account to manage your pet insurance quote."
              : "Welcome back. Login to continue your pet insurance journey."}
          </p>

          {isCreate && (
            <div className="login-grid">
              <input
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="First name"
              />
              <input
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Last name"
              />
            </div>
          )}

          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Email address"
          />

          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password"
          />

          {isCreate && (
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Confirm password"
            />
          )}

          <button type="submit">
            {isCreate ? "Create Account" : "Login"}
          </button>

          <p className="switch-text">
            {isCreate ? "Already have an account?" : "Don’t have an account?"}
            <span onClick={() => setIsCreate(!isCreate)}>
              {isCreate ? " Login" : " Create Account"}
            </span>
          </p>
        </form>
      </main>
    </>
  );
}

export default Login;