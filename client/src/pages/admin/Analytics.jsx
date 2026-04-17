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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { ngoToken } = useAuth();
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
      setError(err.response?.data?.message || 'Could not load analytics right now.');
    }
  }, [ngoToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="dashboard-layout">
        <AdminSidebar />
        <main className="main-content">
          {error ? <div className="error-msg">{error}</div> : <p>Loading analytics...</p>}
        </main>
      </div>
    );
  }

  const donationsPerDayChart = {
    labels: data.donationsPerDay.map((x) => x.date),
    datasets: [
      {
        label: 'Donations',
        data: data.donationsPerDay.map((x) => x.count),
        backgroundColor: '#2e7d32',
      },
    ],
  };

  const categoryChart = {
    labels: data.categoryDistribution.map((x) => x.category),
    datasets: [
      {
        label: 'Food Categories',
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
        label: 'Delivery Success Rate (%)',
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
        <h1 style={{ marginBottom: '1rem' }}>📊 Analytics</h1>

        <div className="stats-grid">
          <Stat label="Total Donations" value={data.totalDonations} />
          <Stat label="Delivered Orders" value={data.totalDeliveredOrders} />
          <Stat label="Active Orders" value={data.totalPendingOrders} />
          <Stat
            label="Total Food Saved"
            value={`${data.environmentalImpact?.totalFoodSavedKg ?? 0} kg`}
          />
          <Stat
            label="CO2 Emissions Prevented"
            value={`${data.environmentalImpact?.totalCo2PreventedKg ?? 0} kg`}
          />
          <Stat
            label="Meals Served"
            value={data.environmentalImpact?.mealsServedEquivalent ?? 0}
          />
          <Stat
            label="Most Donated Category"
            value={data.mostDonatedFoodCategory?.category || 'N/A'}
          />
          <Stat label="Total Users" value={data.totalUsers} />
          <Stat label="Feedbacks" value={data.totalFeedbacks} />
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Donations Per Day</h3>
            <Bar
              data={donationsPerDayChart}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Food Category Share</h3>
            <Pie data={categoryChart} options={{ responsive: true }} />
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1rem' }}>Delivery Success Rate</h3>
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
