import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GAMES = [
  { id: 'chess', label: 'Chess', icon: '♟' },
  { id: 'carrom', label: 'Carrom', icon: '🎯' },
  { id: 'cards', label: 'Cards', icon: '🃏' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'table-tennis', label: 'Table Tennis', icon: '🏓' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'];
const VENUES = ['home', 'society-clubhouse', 'local-ground', 'sports-complex'];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    skillLevel: 'beginner',
    preferredGames: [],
    availability: { days: [], timeSlots: [] },
    preferredVenues: [],
    bio: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleArray = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const toggleAvailability = (type, value) => {
    setForm((prev) => {
      const arr = prev.availability[type];
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [type]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        },
      };
    });
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.preferredGames.length === 0) {
      setError('Please select at least one game');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      location: { city: form.city },
      skillLevel: form.skillLevel,
      preferredGames: form.preferredGames,
      availability: form.availability,
      preferredVenues: form.preferredVenues,
      bio: form.bio,
    };

    console.log('Sending registration payload:', JSON.stringify(payload, null, 2));
    let result;
    try {
      result = await register(payload);
    } catch (e) {
      setLoading(false);
      setError('Unexpected error: ' + e.message);
      return;
    }
    setLoading(false);

    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError((result && result.message) || 'Registration failed - check backend is running');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="logo">🏆 SportsMatch</div>
          <h1>Create your account</h1>
          <p>Find nearby game partners in minutes</p>
        </div>

        {/* Step indicator */}
        <div className="steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span> Account
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span> Preferences
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Full name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
              </div>
              <div className="form-group">
                <label>Email address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="abc@example.com" required />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="0000000" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
                </div>
                <div className="form-group">
                  <label>Confirm password</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Continue →</button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label>City / Area</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="Salem, Tamil Nadu" />
              </div>

              <div className="form-group">
                <label>Skill level</label>
                <div className="radio-group">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label key={level} className={`radio-option ${form.skillLevel === level ? 'selected' : ''}`}>
                      <input type="radio" name="skillLevel" value={level} checked={form.skillLevel === level} onChange={handleChange} hidden />
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Preferred games <span className="required">*</span></label>
                <div className="chip-grid">
                  {GAMES.map((g) => (
                    <button key={g.id} type="button"
                      className={`chip ${form.preferredGames.includes(g.id) ? 'chip-selected' : ''}`}
                      onClick={() => toggleArray('preferredGames', g.id)}>
                      {g.icon} {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Available days</label>
                <div className="chip-grid">
                  {DAYS.map((d) => (
                    <button key={d} type="button"
                      className={`chip ${form.availability.days.includes(d) ? 'chip-selected' : ''}`}
                      onClick={() => toggleAvailability('days', d)}>
                      {d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Preferred time</label>
                <div className="chip-grid">
                  {TIME_SLOTS.map((t) => (
                    <button key={t} type="button"
                      className={`chip ${form.availability.timeSlots.includes(t) ? 'chip-selected' : ''}`}
                      onClick={() => toggleAvailability('timeSlots', t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Preferred venues</label>
                <div className="chip-grid">
                  {VENUES.map((v) => (
                    <button key={v} type="button"
                      className={`chip ${form.preferredVenues.includes(v) ? 'chip-selected' : ''}`}
                      onClick={() => toggleArray('preferredVenues', v)}>
                      {v.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Short bio (optional)</label>
                <textarea name="bio" value={form.bio} onChange={handleChange}
                  placeholder="Tell partners a bit about yourself..." rows={2} maxLength={200} />
                <span className="char-count">{form.bio.length}/200</span>
              </div>

              <div className="form-row">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
