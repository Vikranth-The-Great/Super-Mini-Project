import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationAssistant from '../../components/LocationAssistant';

const AREAS = [
  'Indiranagar','Koramangala','Whitefield','Jayanagar','Rajajinagar',
  'Malleshwaram','Yelahanka','Electronic City','Bannerghatta Road','Marathahalli',
  'HSR Layout','BTM Layout','JP Nagar','Hebbal','Vijayanagar',
  'Basavanagudi','Sadashivanagar','RT Nagar','Padmanabhanagar','KR Puram',
];

export default function AdminSignup() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phoneno: '', address: '', location: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginNgo } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationResolved = ({ area, address, latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      location: area || prev.location,
      address: address
        ? `${address}${latitude && longitude ? ` (Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)})` : ''}`
        : prev.address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 3)    return setError('Name must be at least 3 characters.');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters.');
    if (!/^\d{10}$/.test(form.phoneno)) return setError('Phone number must be exactly 10 digits.');
    if (form.address.trim().length < 5) return setError('Address must be at least 5 characters.');
    if (!form.location)                 return setError('Please select a location.');

    setLoading(true);
    try {
      const { data } = await axios.post('/api/ngo/auth/register', form);
      loginNgo(data.token, data.admin || data.ngo);
      navigate('/ngo');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <h2>🏢 NGO Partner Registration</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="name" value={form.name} onChange={handleChange} required minLength={3} />
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
                minLength={6}
                autoComplete="new-password"
              />
              <span className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
                {showPw ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" rows={3} value={form.address} onChange={handleChange} required minLength={5} />
          </div>
          <div className="form-group">
            <label>Location (Area)</label>
            <select name="location" value={form.location} onChange={handleChange} required>
              <option value="">-- Select Area --</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <LocationAssistant
            areaOptions={AREAS}
            onResolved={handleLocationResolved}
            title="Office Location"
            helperText="Use live location or pick your office/service point on map."
          />

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '.5rem' }}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.9rem', color: 'var(--muted)' }}>
          Already have an NGO account? <Link to="/ngo/signin" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
