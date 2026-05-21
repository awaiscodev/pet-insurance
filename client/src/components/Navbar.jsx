import { Link } from "react-router-dom";
import { PawPrint, UserCircle } from "lucide-react";
import "../styles/Navbar.css";

function Navbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("userAccount"));

  return (
    <header className="site-navbar">
      <Link to="/" className="nav-brand">
        <PawPrint size={30} />
        <div>
          <h2>PetsBest</h2>
          <span>Pet Health Insurance</span>
        </div>
      </Link>

      <nav className="main-nav">
        <div className="nav-item">
          <span>Pet Insurance Plans</span>
          <div className="dropdown-menu">
            <a>Dog & Puppy Insurance</a>
            <a>Cat & Kitten Insurance</a>
            <a>Pet Wellness Plans</a>
            <a>Coverage</a>
            <a>Pet Insurance 101</a>
            <a>How To Pick The Right Plan</a>
            <a>Pet Insurance Cost</a>
          </div>
        </div>

        <div className="nav-item">
          <span>Why Pets Best</span>
          <div className="dropdown-menu small-menu">
            <a>Pet Insurance Comparison</a>
            <a>Reviews & Testimonials</a>
            <a>Direct Vet Pay</a>
            <a>24/7 Emergency Vet Helpline</a>
          </div>
        </div>

        <div className="nav-item">
          <span>Resources</span>
          <div className="dropdown-menu big-menu">
            <a>Blog</a>
            <a>New Dog Owner's Guide</a>
            <a>New Cat Owner's Guide</a>
            <a>Summer Pet Guide</a>
            <a>Senior Pet Owner's Guide</a>
            <a>Best Vet Near Me</a>
            <a>Pets Best Mobile App</a>
            <a>Frequently Asked Questions</a>
            <a>How To File a Claim</a>
            <a>After Filing a Claim</a>
          </div>
        </div>

        <div className="nav-item">
          <span>About Us</span>
          <div className="dropdown-menu small-menu">
            <a>The Pets Best Story</a>
            <a>Community Involvement</a>
            <a>Careers</a>
            <a>Contact Us</a>
          </div>
        </div>

        <Link className="quote-link" to="/quote">Get a Quote</Link>

        {isLoggedIn ? (
          <div className="profile-box">
            <UserCircle size={28} />
            <span>{user?.firstName || "Profile"}</span>
          </div>
        ) : (
          <Link className="login-link" to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;