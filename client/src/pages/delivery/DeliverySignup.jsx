import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationAssistant from '../../components/LocationAssistant';

const CITIES = [
  'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Shivamogga',
];

export default function DeliverySignup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneno: '', city: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginDelivery } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationResolved = ({ area }) => {
    if (!area) return;
    setForm((prev) => ({ ...prev, city: area }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 3) return setError('Name must be at least 3 characters.');
    if (form.password.length < 6)    return setError('Password must be at least 6 characters.');
    if (!/^\d{10}$/.test(form.phoneno)) return setError('Phone number must be exactly 10 digits.');
    if (!form.city)                  return setError('Please choose a city.');

    setLoading(true);
    try {
      const { data } = await axios.post('/api/delivery/auth/register', form);
      loginDelivery(data.token, data.person);
      navigate('/delivery');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>🚴 Delivery Sign Up</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phoneno"
              value={form.phoneno}
              onChange={handleChange}
              required
              pattern="\d{10}"
              placeholder="10 digit number"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <span className="pw-toggle" onClick={() => setShowPw((v) => !v)}>{showPw ? '🙈' : '👁️'}</span>
            </div>
          </div>
          <div className="form-group">
            <label>City</label>
            <select name="city" value={form.city} onChange={handleChange} required>
              <option value="">-- Select City --</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <LocationAssistant
            areaOptions={CITIES}
            onResolved={handleLocationResolved}
            title="Service City Locator"
            helperText="Share live location or choose on map to auto-select your city."
          />

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.9rem', color: 'var(--muted)' }}>
          Already registered? <Link to="/delivery/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
