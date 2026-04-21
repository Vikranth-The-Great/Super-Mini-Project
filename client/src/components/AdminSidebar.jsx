import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { logoutNgo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutNgo();
    navigate('/ngo/signin');
  };

  return (
    <aside className="sidebar">
      <h2>NGO Panel</h2>
      <Link to="/ngo">Dashboard</Link>
      <Link to="/ngo/profile">Track Orders</Link>
      <Link to="/ngo/analytics">Analytics</Link>
      <Link to="/ngo/donate">By Location</Link>
      <Link to="/ngo/feedback">Feedback</Link>
      <Link to="/ngo/notifications">Notifications</Link>
      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
}
