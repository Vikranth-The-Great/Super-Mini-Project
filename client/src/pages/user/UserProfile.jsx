import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, userToken, logoutUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadPageData = useCallback(async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${userToken}` } };
      const [donationsRes, notificationsRes] = await Promise.all([
        axios.get('/api/donations/my', auth),
        axios.get('/api/notifications/my', auth),
      ]);
      setDonations(donationsRes.data);
      setNotifications(notificationsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh profile data right now.');
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  useEffect(() => {
    loadPageData();
    const id = setInterval(() => {
      loadPageData();
    }, 8000);
    return () => clearInterval(id);
  }, [loadPageData]);

  const markAllNotificationsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="page-container">
        {/* Profile card */}
        <div className="card" style={{ maxWidth: 500, marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--green)', marginBottom: '1rem' }}>👤 My Profile</h2>
          <ProfileRow label="Name"   value={user.name} />
          <ProfileRow label="Email"  value={user.email} />
          <ProfileRow label="Gender" value={user.gender?.charAt(0).toUpperCase() + user.gender?.slice(1)} />
          <button className="btn-danger" onClick={handleLogout} style={{ marginTop: '1rem', width: '100%' }}>
            Logout
          </button>
        </div>

        {/* Donations table */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          {error && <div className="error-msg">{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '.8rem' }}>
            <h3 style={{ marginBottom: 0 }}>🔔 Donation Updates</h3>
            <button className="btn-primary" onClick={markAllNotificationsRead} style={{ padding: '.35rem .8rem' }}>
              Mark All Read
            </button>
          </div>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading updates…</p>
          ) : notifications.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No updates yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '.5rem' }}>
              {notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderLeft: `4px solid ${n.isRead ? '#c7c7c7' : 'var(--green)'}`,
                    borderRadius: 8,
                    padding: '.55rem .7rem',
                    background: n.isRead ? '#fafafa' : '#f5fff8',
                  }}
                >
                  <div style={{ fontSize: '.92rem', fontWeight: 600 }}>{n.message}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donations table */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>🍱 Your Donations</h3>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading donations…</p>
          ) : donations.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>You haven't donated yet. <a href="/donate" style={{ color: 'var(--green)' }}>Donate now →</a></p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Submitted</th>
                    <th>Expiry</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d._id}>
                      <td>{d.food}</td>
                      <td><span className={`pill ${d.type === 'veg' ? 'pill-green' : 'pill-orange'}`}>{d.type}</span></td>
                      <td>{d.category}</td>
                      <td>{d.quantity}</td>
                      <td>{new Date(d.createdAt).toLocaleString()}</td>
                      <td>{d.expiryDate?.slice(0,10)} {d.expiryTime}</td>
                      <td>
                        <span className={`pill ${d.deliveredAt ? 'pill-green' : d.deliveryBy ? 'pill-blue' : d.assignedTo ? 'pill-orange' : ''}`}>
                          {d.deliveredAt ? 'Delivered' : d.deliveryBy ? 'In Transit' : d.assignedTo ? 'Assigned' : 'Posted'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '.5rem 0', borderBottom: '1px solid #eee' }}>
      <span style={{ fontWeight: 600, minWidth: 80, color: 'var(--muted)' }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
