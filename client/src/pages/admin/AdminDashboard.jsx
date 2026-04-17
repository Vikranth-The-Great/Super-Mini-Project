import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { ngoToken } = useAuth();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalFeedbacks: 0, totalDonations: 0 });
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');

  const auth = { headers: { Authorization: `Bearer ${ngoToken}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [donRes, anRes] = await Promise.all([
        axios.get('/api/donations/available-ngo', auth),
        axios.get('/api/analytics', auth),
      ]);
      setRows(donRes.data);
      setStats({
        totalUsers: anRes.data.totalUsers,
        totalFeedbacks: anRes.data.totalFeedbacks,
        totalDonations: anRes.data.totalDonations,
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh dashboard right now.');
    } finally {
      setLoading(false);
    }
  }, [ngoToken]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 8000);
    return () => clearInterval(id);
  }, [load]);

  const claim = async (id) => {
    setError('');
    setClaimingId(id);
    try {
      await axios.put(`/api/donations/${id}/assign`, {}, auth);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not claim this donation. Please try again.');
      await load();
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📦 {t('ngo_donation_desk')}</h1>

        <div className="stats-grid">
          <Stat label={t('total_users')} value={stats.totalUsers} />
          <Stat label={t('feedbacks')} value={stats.totalFeedbacks} />
          <Stat label={t('total_donations')} value={stats.totalDonations} />
        </div>

        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading donations…</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No unassigned non-expired donations available.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('food_name')}</th>
                    <th>{t('category')}</th>
                    <th>{t('phone')}</th>
                    <th>Date/Time</th>
                    <th>{t('expiry_time')}</th>
                    <th>Priority</th>
                    <th>{t('address')}</th>
                    <th>{t('quantity')}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td>{r.donorName}</td>
                      <td>{r.food}</td>
                      <td>{r.category}</td>
                      <td>{r.phoneno}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.expiryDate?.slice(0,10)} {r.expiryTime}</td>
                      <td><PriorityTag priority={r.priority} /></td>
                      <td>{r.address}</td>
                      <td>{r.quantity}</td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => claim(r._id)}
                          disabled={claimingId === r._id}
                        >
                          {claimingId === r._id ? t('claiming') : t('get_food')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PriorityTag({ priority }) {
  const tone =
    priority === 'High'
      ? { bg: '#fdecec', fg: '#b71c1c' }
      : priority === 'Medium'
      ? { bg: '#fff3e0', fg: '#ef6c00' }
      : { bg: '#e8f5e9', fg: '#2e7d32' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '.25rem .6rem',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: '.78rem',
        background: tone.bg,
        color: tone.fg,
      }}
    >
      {priority || 'Low'}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}
