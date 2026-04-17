import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DeliverySidebar from '../../components/DeliverySidebar';
import { useAuth } from '../../context/AuthContext';

export default function MyOrders() {
  const { deliveryToken, delivery } = useAuth();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placingId, setPlacingId] = useState(null);

  const auth = { headers: { Authorization: `Bearer ${deliveryToken}` } };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/donations/my-deliveries', auth);
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not refresh your orders right now.');
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

  const place = async (id) => {
    setError('');
    setMsg('');
    setPlacingId(id);
    try {
      await axios.put(`/api/donations/${id}/place`, {}, auth);
      setMsg('Order marked as placed successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark this order as placed.');
      await load();
    } finally {
      setPlacingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => [r.donorName, r.phoneno, r.location, r.address].join(' ').toLowerCase().includes(q));
  }, [rows, query]);

  const assigned = rows.length;
  const placed = rows.filter((r) => !!r.deliveredAt).length;

  return (
    <div className="dashboard-layout">
      <DeliverySidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📦 My Orders</h1>

        <div className="stats-grid">
          <Stat label="Assigned Orders" value={assigned} />
          <Stat label="Placed Orders" value={placed} />
          <Stat label="Delivery Partner" value={delivery?.name || 'N/A'} />
        </div>

        {msg && <div className="success-msg">{msg}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <input placeholder="Search my orders..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading orders…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No orders assigned yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Date/Time</th>
                    <th>Expiry</th>
                    <th>Pickup Address</th>
                    <th>Delivery Address</th>
                    <th>Directions</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(r.address)}&destination=${encodeURIComponent(r.assignedTo?.address || r.address)}`;
                    const status = r.deliveredAt ? 'Placed' : 'In Transit';
                    return (
                      <tr key={r._id}>
                        <td>{r.donorName}</td>
                        <td>{r.phoneno}</td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td>{r.expiryDate?.slice(0,10)} {r.expiryTime}</td>
                        <td>{r.address}</td>
                        <td>{r.assignedTo?.address || '-'}</td>
                        <td>
                          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontWeight: 600 }}>Get Directions</a>
                        </td>
                        <td>
                          <span className={`pill ${r.deliveredAt ? 'pill-green' : 'pill-orange'}`}>{status}</span>
                        </td>
                        <td>
                          {!r.deliveredAt && (
                            <button className="btn-primary" onClick={() => place(r._id)} disabled={placingId === r._id}>
                              {placingId === r._id ? 'Updating…' : 'Order Placed'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
