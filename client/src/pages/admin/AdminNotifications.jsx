import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminNotifications() {
  const { ngoToken } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const auth = { headers: { Authorization: `Bearer ${ngoToken}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/notifications/my', auth);
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh notifications right now.');
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

  const markAllRead = async () => {
    setMarkingAllRead(true);
    setError('');
    try {
      await axios.put('/api/notifications/read-all', {}, auth);
      setRows((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark notifications as read.');
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>🔔 NGO Notifications</h1>

        <div className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <p style={{ color: 'var(--muted)' }}>Review missed real-time updates about new donations and delivery activity.</p>
          <button className="btn-primary" onClick={markAllRead} disabled={markingAllRead}>
            {markingAllRead ? 'Updating…' : 'Mark All Read'}
          </button>
        </div>

        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom: '.9rem' }}>{error}</div>}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading notifications…</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No notifications yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '.55rem' }}>
              {rows.map((n) => (
                <div
                  key={n._id}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderLeft: `4px solid ${n.isRead ? '#c7c7c7' : 'var(--green)'}`,
                    borderRadius: 8,
                    padding: '.6rem .75rem',
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
      </main>
    </div>
  );
}
