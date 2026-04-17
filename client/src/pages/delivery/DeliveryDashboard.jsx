import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import DeliverySidebar from '../../components/DeliverySidebar';
import { useAuth } from '../../context/AuthContext';

export default function DeliveryDashboard() {
  const { deliveryToken, delivery } = useAuth();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [takingId, setTakingId] = useState(null);

  const auth = { headers: { Authorization: `Bearer ${deliveryToken}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [av, my] = await Promise.all([
        axios.get('/api/donations/available-delivery', auth),
        axios.get('/api/donations/my-deliveries', auth),
      ]);
      setRows(av.data);
      setMyRows(my.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh pickups right now.');
    } finally {
      setLoading(false);
    }
  }, [deliveryToken]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 8000);
    return () => clearInterval(id);
  }, [load]);

  const takeOrder = async (id) => {
    setTakingId(id);
    setError('');
    try {
      await axios.put(`/api/donations/${id}/take`, {}, auth);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept this pickup.');
      await load();
    } finally {
      setTakingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.donorName, r.phoneno, r.location, r.address].join(' ').toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div className="dashboard-layout">
      <DeliverySidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>🚚 {t('available_pickups')}</h1>

        <div className="stats-grid">
          <Stat label={t('available_orders')} value={rows.length} />
          <Stat label={t('my_orders')} value={myRows.length} />
          <Stat label={t('current_city')} value={delivery?.city || 'N/A'} />
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <input
            placeholder="Search by name, phone, location, address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading pickups…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No available pickups right now.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('phone')}</th>
                    <th>Date/Time</th>
                    <th>{t('expiry_time')}</th>
                    <th>Pickup {t('address')}</th>
                    <th>Delivery {t('address')}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td>{r.donorName}</td>
                      <td>{r.phoneno}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td>{r.expiryDate?.slice(0,10)} {r.expiryTime}</td>
                      <td>{r.address}</td>
                      <td>{r.assignedTo?.address || '-'}</td>
                      <td>
                        <button className="btn-primary" onClick={() => takeOrder(r._id)} disabled={takingId === r._id}>
                          {takingId === r._id ? 'Accepting…' : t('accept_delivery')}
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

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}
