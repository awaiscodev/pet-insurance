import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, UserCircle, Menu, X } from "lucide-react";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("userAccount") || "{}");

  const closeMenu = () => {
    setOpenMenu(false);
    setOpenProfile(false);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setOpenProfile(false);
    setOpenMenu(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="site-navbar">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        <PawPrint size={30} />
        <div>
          <h2>PetsBest</h2>
          <span>Pet Health Insurance</span>
        </div>
      </Link>

      <button
        type="button"
        className="mobile-toggle"
        onClick={() => setOpenMenu(!openMenu)}
      >
        {openMenu ? <X size={28} /> : <Menu size={28} />}
      </button>

      <nav className={openMenu ? "main-nav show" : "main-nav"}>
        <div className="nav-item">
          <span>Pet Insurance Plans</span>
          <div className="dropdown-menu">
            <Link to="/quote?pet=Dog" onClick={closeMenu}>Dog & Puppy Insurance</Link>
            <Link to="/quote?pet=Cat" onClick={closeMenu}>Cat & Kitten Insurance</Link>
            <Link to="/quote" onClick={closeMenu}>Pet Wellness Plans</Link>
            <Link to="/quote" onClick={closeMenu}>Coverage</Link>
            <Link to="/quote" onClick={closeMenu}>Pet Insurance 101</Link>
            <Link to="/quote" onClick={closeMenu}>How To Pick The Right Plan</Link>
            <Link to="/quote" onClick={closeMenu}>Pet Insurance Cost</Link>
          </div>
        </div>

        <div className="nav-item">
          <span>Why Pets Best</span>
          <div className="dropdown-menu small-menu">
            <Link to="/" onClick={closeMenu}>Pet Insurance Comparison</Link>
            <Link to="/" onClick={closeMenu}>Reviews & Testimonials</Link>
            <Link to="/" onClick={closeMenu}>Direct Vet Pay</Link>
            <Link to="/" onClick={closeMenu}>24/7 Emergency Vet Helpline</Link>
          </div>
        </div>

        <div className="nav-item">
          <span>Resources</span>
          <div className="dropdown-menu big-menu">
            <Link to="/" onClick={closeMenu}>Blog</Link>
            <Link to="/" onClick={closeMenu}>New Dog Owner&apos;s Guide</Link>
            <Link to="/" onClick={closeMenu}>New Cat Owner&apos;s Guide</Link>
            <Link to="/" onClick={closeMenu}>Summer Pet Guide</Link>
            <Link to="/" onClick={closeMenu}>Senior Pet Owner&apos;s Guide</Link>
            <Link to="/" onClick={closeMenu}>Best Vet Near Me</Link>
            <Link to="/" onClick={closeMenu}>Pets Best Mobile App</Link>
            <Link to="/" onClick={closeMenu}>Frequently Asked Questions</Link>
            <Link to="/" onClick={closeMenu}>How To File a Claim</Link>
            <Link to="/" onClick={closeMenu}>After Filing a Claim</Link>
          </div>
        </div>

        <div className="nav-item">
          <span>About Us</span>
          <div className="dropdown-menu small-menu">
            <Link to="/" onClick={closeMenu}>The Pets Best Story</Link>
            <Link to="/" onClick={closeMenu}>Community Involvement</Link>
            <Link to="/" onClick={closeMenu}>Careers</Link>
            <Link to="/" onClick={closeMenu}>Contact Us</Link>
          </div>
        </div>

        <Link className="quote-link" to="/quote" onClick={closeMenu}>
          Get a Quote
        </Link>

        {isLoggedIn ? (
          <div className="profile-wrap">
            <button
              type="button"
              className="profile-box"
              onClick={() => setOpenProfile(!openProfile)}
            >
              <UserCircle size={30} />
              <span>{user?.firstName || "Profile"}</span>
            </button>

            {openProfile && (
              <div className="profile-menu">
                <p>{user?.firstName} {user?.lastName}</p>
                <small>{user?.email}</small>
                <button type="button" onClick={logout}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link className="login-link" to="/login" onClick={closeMenu}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;