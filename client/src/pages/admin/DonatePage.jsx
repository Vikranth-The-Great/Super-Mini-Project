import { useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import LocationAssistant from '../../components/LocationAssistant';

const AREAS = [
  'Indiranagar','Koramangala','Whitefield','Jayanagar','Rajajinagar',
  'Malleshwaram','Yelahanka','Electronic City','Bannerghatta Road','Marathahalli',
  'HSR Layout','BTM Layout','JP Nagar','Hebbal','Vijayanagar',
  'Basavanagudi','Sadashivanagar','RT Nagar','Padmanabhanagar','KR Puram',
];

export default function DonatePage() {
  const { ngoToken } = useAuth();
  const [location, setLocation] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!location) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`/api/donations/by-location?location=${encodeURIComponent(location)}`, {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || 'Could not search donations right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📍 Donations by Location</h1>

        <form onSubmit={search} className="card" style={{ marginBottom: '1rem', maxWidth: 520 }}>
          <div className="form-group">
            <label>Select Area</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} required>
              <option value="">-- Select Area --</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <LocationAssistant
            areaOptions={AREAS}
            onResolved={({ area }) => area && setLocation(area)}
            title="Find Area Quickly"
            helperText="Share live location or point on map to auto-select area."
          />

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        </form>

        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom: '.9rem' }}>{error}</div>}
          {!location ? (
            <p style={{ color: 'var(--muted)' }}>Select a location and click Search.</p>
          ) : loading ? (
            <p style={{ color: 'var(--muted)' }}>Loading…</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No results found for selected location.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Food</th>
                    <th>Category</th>
                    <th>Phone</th>
                    <th>Date/Time</th>
                    <th>Expiry</th>
                    <th>Address</th>
                    <th>Quantity</th>
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
                      <td>{r.address}</td>
                      <td>{r.quantity}</td>
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
