import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { logoutNgo } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutNgo();
    navigate('/ngo/signin');
  };

  return (
    <aside className="sidebar">
      <h2>{t('ngo_panel')}</h2>
      <Link to="/ngo">{t('ngo_dashboard_link')}</Link>
      <Link to="/ngo/profile">{t('ngo_track_orders')}</Link>
      <Link to="/ngo/analytics">{t('analytics')}</Link>
      <Link to="/ngo/donate">{t('ngo_by_location')}</Link>
      <Link to="/ngo/feedback">{t('feedbacks')}</Link>
      <Link to="/ngo/notifications">{t('notifications')}</Link>
      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        {t('logout')}
      </button>
    </aside>
  );
}
