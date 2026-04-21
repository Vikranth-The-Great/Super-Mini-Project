import { Link } from 'react-router-dom';

export default function IndexPage() {
  return (
    <div className="landing-shell">
      <div className="landing-orb landing-orb-left" aria-hidden="true" />
      <div className="landing-orb landing-orb-right" aria-hidden="true" />

      <h1 className="landing-title">FoodDonate</h1>
      <p className="landing-subtitle">
        A platform to reduce food waste and feed the underprivileged. Choose your role to get started.
      </p>

      <div className="landing-grid">
        <RoleCard
          icon="User"
          title="User"
          desc="Donate surplus food and track your impact."
          to="/signin"
        />
        <RoleCard
          icon="NGO"
          title="NGO Partner"
          desc="Coordinate and track incoming donations in your area."
          to="/ngo/signin"
        />
        <RoleCard
          icon="Delivery"
          title="Delivery"
          desc="Pick up and deliver food to those in need."
          to="/delivery/login"
        />
      </div>

      <Link to="/find-food" className="find-food-link">
        <button className="find-food-cta">
          Find Free Food Near You
        </button>
      </Link>
    </div>
  );
}

function RoleCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="role-link">
      <div className="role-card">
        <div className="role-icon">{icon}</div>
        <h3 className="role-title">{title}</h3>
        <p className="role-desc">{desc}</p>
      </div>
    </Link>
  );
}
