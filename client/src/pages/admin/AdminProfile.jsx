import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { ngoToken } = useAuth();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/donations/ngo-tracking', {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      setRows(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('ngo_tracking_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [ngoToken, t]);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      load();
    }, 8000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📍 {t('ngo_order_tracking')}</h1>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>{t('ngo_tracking_no_orders')}</p>
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
                    <th>{t('address')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('delivery_partner')}</th>
                    <th>{t('placed_at')}</th>
                    <th>{t('status')}</th>
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
                      <td>{r.address}</td>
                      <td>{r.quantity}</td>
                      <td>{r.deliveryPartner?.name ? `${r.deliveryPartner.name} (${r.deliveryPartner.city})` : '-'}</td>
                      <td>{r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : '-'}</td>
                      <td>
                        <span className={`pill ${r.status === 'Delivered' ? 'pill-green' : r.status === 'In Transit' ? 'pill-blue' : 'pill-orange'}`}>
                          {r.status}
                        </span>
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
