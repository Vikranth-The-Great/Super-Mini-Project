import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { ngoToken } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await axios.get('/api/analytics', {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      setData(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('analytics_load_failed'));
    }
  }, [ngoToken, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <main className="main-content">
          {error ? <div className="error-msg">{error}</div> : <p>{t('analytics_loading')}</p>}
        </main>
      </div>
    );
  }

  const donationsPerDayChart = {
    labels: data.donationsPerDay.map((x) => x.date),
    datasets: [
      {
        label: t('analytics_donations'),
        data: data.donationsPerDay.map((x) => x.count),
        backgroundColor: '#2e7d32',
      },
    ],
  };

  const categoryChart = {
    labels: data.categoryDistribution.map((x) => x.category),
    datasets: [
      {
        label: t('analytics_food_categories'),
        data: data.categoryDistribution.map((x) => x.count),
        backgroundColor: ['#ef5350', '#ffa726', '#66bb6a', '#42a5f5', '#ab47bc', '#26c6da'],
        borderWidth: 1,
      },
    ],
  };

  const successRateChart = {
    labels: data.deliverySuccessRate.map((x) => x.date),
    datasets: [
      {
        label: t('analytics_success_rate_label'),
        data: data.deliverySuccessRate.map((x) => x.rate),
        borderColor: '#1e88e5',
        backgroundColor: 'rgba(30, 136, 229, 0.2)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '1rem' }}>📊 {t('analytics')}</h1>

        <div className="stats-grid">
          <Stat label={t('total_donations')} value={data.totalDonations} />
          <Stat label={t('analytics_delivered_orders')} value={data.totalDeliveredOrders} />
          <Stat label={t('analytics_active_orders')} value={data.totalPendingOrders} />
          <Stat
            label={t('food_saved')}
            value={`${data.environmentalImpact?.totalFoodSavedKg ?? 0} kg`}
          />
          <Stat
            label={t('co2_prevented')}
            value={`${data.environmentalImpact?.totalCo2PreventedKg ?? 0} kg`}
          />
          <Stat
            label={t('meals_served')}
            value={data.environmentalImpact?.mealsServedEquivalent ?? 0}
          />
          <Stat
            label={t('analytics_most_donated_category')}
            value={data.mostDonatedFoodCategory?.category || t('analytics_na')}
          />
          <Stat label={t('total_users')} value={data.totalUsers} />
          <Stat label={t('feedbacks')} value={data.totalFeedbacks} />
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>{t('analytics_donations_per_day')}</h3>
            <Bar
              data={donationsPerDayChart}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>{t('analytics_food_category_share')}</h3>
            <Pie data={categoryChart} options={{ responsive: true }} />
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('analytics_delivery_success_rate')}</h3>
            <Line
              data={successRateChart}
              options={{
                responsive: true,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          </div>
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
