import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <h1>Turn extra meals into real impact 🌿</h1>
        <p>
          Every plate counts. Donate surplus food and we'll make sure it reaches someone who truly
          needs it — fresh, fast, and with care.
        </p>
        <div className="hero-cta-row">
          <Link to="/donate">
            <button className="btn-primary hero-cta-primary">
              Donate Food Now
            </button>
          </Link>
          <Link to="/find-food">
            <button className="btn-secondary hero-cta-secondary">
              Find Free Food Near You
            </button>
          </Link>
        </div>
      </section>

      {/* Impact */}
      <section className="page-container">
        <h2 className="impact-title">Our Impact</h2>
        <div className="stats-grid impact-wrap">
          <div className="stat-box"><h3>500+</h3><p>Meals Donated</p></div>
          <div className="stat-box"><h3>50+</h3><p>Volunteers</p></div>
          <div className="stat-box"><h3>20+</h3><p>Locations Covered</p></div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="page-container">
          <h2 className="impact-title">Doorstep Pickup</h2>
          <div className="steps-grid">
            <Step num="1" title="Fill Donation Form" desc="Provide food details, quantity, expiry, and your address." />
            <Step num="2" title="NGO Reviews"       desc="A local NGO partner claims your donation and schedules a pickup." />
            <Step num="3" title="Delivery Partner"  desc="A delivery volunteer picks it up from your doorstep." />
            <Step num="4" title="Fed with Love"     desc="The food reaches someone in need — thanks to you!" />
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className="card step-card">
      <div className="step-badge">
        {num}
      </div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}
