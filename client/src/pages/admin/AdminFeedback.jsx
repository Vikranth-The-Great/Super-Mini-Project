import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminFeedback() {
  const { ngoToken } = useAuth();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/feedback', {
          headers: { Authorization: `Bearer ${ngoToken}` },
        });
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ngoToken]);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>💬 {t('ngo_user_feedback')}</h1>
        <div className="card">
          {loading ? (
            <p style={{ color: 'var(--muted)' }}>{t('ngo_feedback_loading')}</p>
          ) : rows.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>{t('ngo_feedback_none')}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('email')}</th>
                    <th>{t('message')}</th>
                    <th>{t('submitted_at')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.message}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
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
