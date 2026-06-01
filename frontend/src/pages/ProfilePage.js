import React, { useState } from 'react';
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

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    skillLevel: user?.skillLevel || 'beginner',
    bio: user?.bio || '',
    preferredGames: user?.preferredGames || [],
    availability: user?.availability || { days: [], timeSlots: [] },
    preferredVenues: user?.preferredVenues || [],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await updateProfile({
      name: form.name,
      phone: form.phone,
      location: { city: form.city },
      skillLevel: form.skillLevel,
      bio: form.bio,
      preferredGames: form.preferredGames,
      availability: form.availability,
      preferredVenues: form.preferredVenues,
    });
    setSaving(false);
    if (result.success) {
      setSuccess('Profile updated!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="avatar-circle">{initials}</div>
        <div className="profile-meta">
          <h1>{user?.name}</h1>
          <p>{user?.location?.city || 'Location not set'}</p>
          <span className={`badge badge-${user?.skillLevel}`}>
            {user?.skillLevel?.charAt(0).toUpperCase() + user?.skillLevel?.slice(1)}
          </span>
        </div>
        <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : '✏ Edit profile'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-body">
        {/* Games section */}
        <section className="profile-section">
          <h2>Preferred games</h2>
          {editing ? (
            <div className="chip-grid">
              {GAMES.map((g) => (
                <button key={g.id} type="button"
                  className={`chip ${form.preferredGames.includes(g.id) ? 'chip-selected' : ''}`}
                  onClick={() => toggleArray('preferredGames', g.id)}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="chip-grid">
              {(user?.preferredGames || []).length === 0
                ? <span className="empty-state">No games selected</span>
                : user.preferredGames.map((g) => {
                    const game = GAMES.find((gm) => gm.id === g);
                    return (
                      <span key={g} className="chip chip-selected chip-static">
                        {game?.icon} {game?.label || g}
                      </span>
                    );
                  })}
            </div>
          )}
        </section>

        {/* Availability */}
        <section className="profile-section">
          <h2>Availability</h2>
          {editing ? (
            <>
              <p className="section-sublabel">Days</p>
              <div className="chip-grid">
                {DAYS.map((d) => (
                  <button key={d} type="button"
                    className={`chip ${form.availability.days.includes(d) ? 'chip-selected' : ''}`}
                    onClick={() => toggleAvailability('days', d)}>
                    {d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)}
                  </button>
                ))}
              </div>
              <p className="section-sublabel" style={{ marginTop: '12px' }}>Time slots</p>
              <div className="chip-grid">
                {TIME_SLOTS.map((t) => (
                  <button key={t} type="button"
                    className={`chip ${form.availability.timeSlots.includes(t) ? 'chip-selected' : ''}`}
                    onClick={() => toggleAvailability('timeSlots', t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="availability-display">
              <div>
                <span className="avail-label">Days: </span>
                {(user?.availability?.days || []).length === 0
                  ? <span className="empty-state">Not set</span>
                  : user.availability.days.map((d) => (
                      <span key={d} className="chip chip-static">
                        {d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3)}
                      </span>
                    ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <span className="avail-label">Time: </span>
                {(user?.availability?.timeSlots || []).length === 0
                  ? <span className="empty-state">Not set</span>
                  : user.availability.timeSlots.map((t) => (
                      <span key={t} className="chip chip-static">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    ))}
              </div>
            </div>
          )}
        </section>

        {/* Personal info */}
        <section className="profile-section">
          <h2>Personal info</h2>
          {editing ? (
            <div className="edit-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 ..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Skill level</label>
                  <select name="skillLevel" value={form.skillLevel} onChange={handleChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} maxLength={200} />
                <span className="char-count">{form.bio.length}/200</span>
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
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item"><span>Email</span><strong>{user?.email}</strong></div>
              <div className="info-item"><span>Phone</span><strong>{user?.phone || '—'}</strong></div>
              <div className="info-item"><span>City</span><strong>{user?.location?.city || '—'}</strong></div>
              <div className="info-item"><span>Bio</span><strong>{user?.bio || '—'}</strong></div>
              <div className="info-item">
                <span>Venues</span>
                <strong>
                  {(user?.preferredVenues || []).length === 0 ? '—'
                    : user.preferredVenues.map((v) => v.replace(/-/g, ' ')).join(', ')}
                </strong>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
