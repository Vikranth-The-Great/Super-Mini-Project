import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AREAS = [
  'Indiranagar','Koramangala','Whitefield','Jayanagar','Rajajinagar',
  'Malleshwaram','Yelahanka','Electronic City','Bannerghatta Road','Marathahalli',
  'HSR Layout','BTM Layout','JP Nagar','Hebbal','Vijayanagar',
  'Basavanagudi','Sadashivanagar','RT Nagar','Padmanabhanagar','KR Puram',
];

export default function UserSignup() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', gender: '', phoneno: '', location: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 3)      return setError('Name must be at least 3 characters.');
    if (form.password.length < 6)         return setError('Password must be at least 6 characters.');
    if (!form.gender)                     return setError('Please select your gender.');
    if (!/^\d{10}$/.test(form.phoneno))   return setError('Phone number must be exactly 10 digits.');
    if (!form.location)                   return setError('Please select your location.');

    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', form);
      loginUser(data.token, data.user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>🥗 Create Account</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
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
            <label>Location (Area)</label>
            <select name="location" value={form.location} onChange={handleChange} required>
              <option value="">-- Select Area --</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
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
            <label>Gender</label>
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '.3rem' }}>
              {['male', 'female', 'other'].map((g) => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '.5rem' }}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.9rem', color: 'var(--muted)' }}>
          Already have an account? <Link to="/signin" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
