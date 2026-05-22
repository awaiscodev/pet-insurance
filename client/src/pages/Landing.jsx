import { Link } from "react-router-dom";
import {
  Check,
  DollarSign,
  Smartphone,
  Headphones,
  ShieldPlus,
  HeartPulse,
  Bone,
  Syringe,
  Scissors,
  Star,
  Play,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import "../styles/Landing.css";
import Navbar from "../components/Navbar";

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />

      <section className="pb-hero">
        <div className="hero-content">
          <h1>The Best Pet Insurance for a Lifetime of Care</h1>

          <ul>
            <li><Check size={16} /> Help with coverage for the unexpected</li>
            <li><Check size={16} /> Protection for both dogs and cats</li>
            <li><Check size={16} /> Cover up to 90% on eligible vet bills</li>
          </ul>

          <div className="small-quote-box">
            <p>Get a free personalized quote in seconds!</p>
            <Link to="/quote">Get a Free Quote</Link>
          </div>

          <h3>
            Providing extensive <br />
            pet insurance plans <br />
            for over 900,000 pets¹
          </h3>
        </div>

        <div className="hero-image-card">
          <img
            src="https://images.unsplash.com/photo-1601758063541-d2f50b4aafb2?auto=format&fit=crop&w=700&q=80"
            alt="pet owner with dog"
          />
        </div>
      </section>

      <section className="why-card">
        <h2>Why Choose Pets Best</h2>
        <p>We are pet parents and pet lovers with 20 years of pet insurance experience.</p>

        <div className="why-grid">
          <div>
            <DollarSign />
            <h4>Affordable Plan Options</h4>
            <p>Customizable plans so you can find the perfect plan for your pet.</p>
          </div>
          <div>
            <Smartphone />
            <h4>Easy Claim Experience</h4>
            <p>Claims made easy with a seamless digital experience.</p>
          </div>
          <div>
            <Headphones />
            <h4>Superior Service</h4>
            <p>Our customer service team is always there for you.</p>
          </div>
        </div>
      </section>

      <section className="coverage">
        <h2>Plans with Customizable Coverage</h2>

        <div className="coverage-row">
          <ShieldPlus />
          <div>
            <h4>Accident & Illness Coverage</h4>
            <p>Coverage for unexpected accidents and illnesses.</p>
          </div>
          <div className="mini-icons">
            <span><HeartPulse /> Allergies</span>
            <span><Syringe /> Diabetes</span>
            <span><Bone /> Arthritis</span>
          </div>
        </div>

        <div className="coverage-row">
          <ShieldPlus />
          <div>
            <h4>Accident-Only Coverage</h4>
            <p>Budget friendly coverage for accidents.</p>
          </div>
          <div className="mini-icons">
            <span><Bone /> Bone Fractures</span>
            <span><Scissors /> Torn Nail</span>
            <span><HeartPulse /> Poisoning</span>
          </div>
        </div>

        <div className="coverage-row">
          <ShieldPlus />
          <div>
            <h4>Routine Care Coverage</h4>
            <p>Optional add-on for expected veterinary visits.</p>
          </div>
          <div className="mini-icons">
            <span><HeartPulse /> Vet Visits</span>
            <span><Syringe /> Vaccines</span>
            <span><Scissors /> Dental Cleaning</span>
          </div>
        </div>
      </section>

      <section className="featured">
        <h2>Featured In</h2>
        <div>
          <b>Forbes</b>
          <b>Los Angeles Times</b>
          <b>USA TODAY</b>
          <b>US News</b>
          <b>Buy Side</b>
        </div>
      </section>

      <section className="examples">
        <h2>Pet Insurance Plan Coverage Examples</h2>

        <div className="example-cards">
          <div className="example-card">
            <p>Yogi’s emergency vet visit</p>
            <h4>Claim Amount <span>$8,379</span></h4>
            <h4>Plan Covered <span>$6,839</span></h4>

            <Link to="/quote?pet=Dog" className="insurance-btn">
              <Dog size={22} />
              Dog Insurance
            </Link>
          </div>

          <div className="example-card">
            <p>Tink’s emergency treatment</p>
            <h4>Claim Amount <span>$4,214</span></h4>
            <h4>Plan Covered <span>$2,820</span></h4>

            <Link to="/quote?pet=Cat" className="insurance-btn">
              <Cat size={22} />
              Cat Insurance
            </Link>
          </div>
        </div>

        <Link className="orange-btn" to="/quote">Get a Free Quote</Link>
      </section>

      <section className="reviews">
        <h2>Pet Insurance Reviews & Testimonials</h2>

        <div className="review-box">
          <img
            src="https://images.unsplash.com/photo-1601758175576-648226072e90?auto=format&fit=crop&w=900&q=80"
            alt="cat owner"
          />
          <div className="review-strip">
            <div>
              <b>EXCELLENT</b>
              <p><Star size={14} /> <Star size={14} /> <Star size={14} /> <Star size={14} /> <Star size={14} /></p>
            </div>
            <p>Great coverage and quick claims.</p>
            <p>Very helpful team.</p>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="video-box">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"
            alt="dog"
          />
          <Play />
        </div>

        <div>
          <h2>Enroll Today to Start Protecting Your Loved Ones</h2>
          <Link to="/quote">Get a Free Quote</Link>
        </div>
      </section>

      <footer>
        <div className="footer-grid footer-pro">
          <div>
            <Link to="/" className="footer-brand">
              <PawPrint />
              <div>
                <h3>PetsBest</h3>
                <span>Pet Health Insurance</span>
              </div>
            </Link>
            <p className="footer-desc">
              Simple, affordable pet insurance plans for dogs and cats.
            </p>
          </div>

          <div>
            <h4>Legal</h4>
            <p>Terms & Conditions</p>
            <p>Privacy Policy</p>
            <p>Claims Payment</p>
          </div>

          <div>
            <h4>Stay Connected</h4>
            <p>Facebook</p>
            <p>Instagram</p>
            <p>YouTube</p>
          </div>

          <div>
            <h4>Get In Touch</h4>
            <p>Contact</p>
            <p>Careers</p>
            <p>Media & Press</p>
          </div>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} PetsBest Pet Health Insurance. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Landing;