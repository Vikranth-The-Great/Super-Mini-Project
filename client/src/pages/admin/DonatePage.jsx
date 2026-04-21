import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t('ngo_location_search_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📍 {t('ngo_donations_by_location')}</h1>

        <form onSubmit={search} className="card" style={{ marginBottom: '1rem', maxWidth: 520 }}>
          <div className="form-group">
            <label>{t('donate_area_location')}</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} required>
              <option value="">{t('donate_select_area')}</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <LocationAssistant
            areaOptions={AREAS}
            onResolved={({ area }) => area && setLocation(area)}
            title={t('ngo_find_area_quickly')}
            helperText={t('ngo_find_area_helper')}
          />

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? t('searching') : t('search')}</button>
        </form>

        <div className="card">
          {error && <div className="error-msg" style={{ marginBottom: '.9rem' }}>{error}</div>}
          {!location ? (
            <p style={{ color: 'var(--muted)' }}>{t('ngo_select_location_search')}</p>
          ) : loading ? (
            <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>{t('ngo_location_no_results')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('food_name')}</th>
                    <th>{t('category')}</th>
                    <th>{t('phone')}</th>
                    <th>{t('date_time')}</th>
                    <th>{t('expiry')}</th>
                    <th>{t('address')}</th>
                    <th>{t('quantity')}</th>
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
