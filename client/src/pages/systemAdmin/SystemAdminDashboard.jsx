import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const POLL_MS = 4000;

const STATUS_CLASS = {
  Posted: 'admin-status-posted',
  Claimed: 'admin-status-claimed',
  Picked: 'admin-status-picked',
  Delivered: 'admin-status-delivered',
  Expired: 'admin-status-expired',
};

export default function SystemAdminDashboard() {
  const [summary, setSummary] = useState({ active: 0, claimed: 0, inTransit: 0, delivered: 0, expired: 0 });
  const [activityFeed, setActivityFeed] = useState([]);
  const [trackingRows, setTrackingRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/system-admin/dashboard');
      setSummary(data.summary || { active: 0, claimed: 0, inTransit: 0, delivered: 0, expired: 0 });
      setActivityFeed(data.activityFeed || []);
      setTrackingRows(data.trackingRows || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load system activity right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const cards = useMemo(
    () => [
      { label: 'Total Active Donations', value: summary.active },
      { label: 'Claimed', value: summary.claimed },
      { label: 'In Transit', value: summary.inTransit },
      { label: 'Delivered', value: summary.delivered },
      { label: 'Expired', value: summary.expired },
    ],
    [summary]
  );

  return (
    <div className="system-admin-shell">
      <header className="system-admin-header card">
        <div>
          <h1>Live Control Room</h1>
          <p>Read-only, real-time monitoring across Donor, NGO, and Volunteer workflows.</p>
        </div>
        <Link to="/" className="btn-secondary system-admin-back">Back to Home</Link>
      </header>

      {error && <div className="error-msg">{error}</div>}

      <section className="stats-grid">
        {cards.map((card) => (
          <div className="stat-box" key={card.label}>
            <h3>{card.value}</h3>
            <p>{card.label}</p>
          </div>
        ))}
      </section>

      <section className="system-admin-grid">
        <article className="card system-admin-feed">
          <h2>Live Activity Feed</h2>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading activity...</p>
          ) : activityFeed.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No activity yet.</p>
          ) : (
            <div className="system-admin-feed-list">
              {activityFeed.map((event) => (
                <div className="system-admin-feed-item" key={event.id}>
                  <div className="system-admin-feed-msg">{event.message}</div>
                  <div className="system-admin-feed-meta">
                    <span>{event.eventType}</span>
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card system-admin-table-wrap">
          <h2>Food Tracking Table</h2>
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading tracking data...</p>
          ) : trackingRows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No food records found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Food ID</th>
                    <th>Donor</th>
                    <th>NGO</th>
                    <th>Volunteer</th>
                    <th>Status</th>
                    <th>Expiry Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingRows.map((row) => (
                    <tr key={`${row.foodId}-${row.expiryTime}`}>
                      <td>{row.foodId}</td>
                      <td>{row.donor}</td>
                      <td>{row.ngo}</td>
                      <td>{row.volunteer}</td>
                      <td>
                        <span className={`system-admin-status ${STATUS_CLASS[row.status] || 'admin-status-posted'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{new Date(row.expiryTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
