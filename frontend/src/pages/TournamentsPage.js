import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GAMES = ['chess','carrom','cards','badminton','table-tennis','cricket','football','volleyball'];

const TournamentsPage = () => {
  const { user, logout } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', game: '', description: '', venue: '', date: '', time: '', maxPlayers: 16, entryFee: 0 });
  const [error, setError] = useState('');
  const [joined, setJoined] = useState({});

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tournaments');
      setTournaments(res.data.tournaments);
    } catch (e) { setError('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchTournaments(); }, []);

  const createTournament = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tournaments', form);
      setShowCreate(false);
      setForm({ name: '', game: '', description: '', venue: '', date: '', time: '', maxPlayers: 16, entryFee: 0 });
      fetchTournaments();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const joinTournament = async (id) => {
    try {
      await axios.post('/api/tournaments/' + id + '/join');
      setJoined(prev => ({ ...prev, [id]: true }));
      fetchTournaments();
    } catch (err) { alert(err.response?.data?.message || 'Failed to join'); }
  };

  const isParticipant = (t) => t.participants?.some(p => (p.user?._id || p.user) === user?._id);

  const statusColor = { upcoming: '#1d4ed8', ongoing: '#d97706', completed: '#059669' };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">SportsMatch</div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Home</Link>
          <Link to="/communities" className="nav-link">Communities</Link>
          <Link to="/recommendations" className="nav-link">For you</Link>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px' }}>Tournaments & Leaderboard</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create tournament</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
          <div className="players-grid">
            {tournaments.map((t) => (
              <div key={t._id} className="player-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{t.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--gray)' }}>{t.game} • {t.venue || 'Venue TBD'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray)' }}>{t.date} {t.time}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                    background: '#eff6ff', color: statusColor[t.status] || '#1d4ed8' }}>
                    {t.status}
                  </span>
                </div>

                {t.description && <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '8px' }}>{t.description}</p>}

                <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                  <span style={{ marginRight: '12px' }}>👥 {t.participants?.length || 0}/{t.maxPlayers}</span>
                  {t.entryFee > 0 && <span>₹{t.entryFee} entry</span>}
                </div>

                {t.participants?.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray)', marginBottom: '6px' }}>LEADERBOARD</p>
                    {t.participants.slice(0, 5).map((p, i) => (
                      <div key={p.user?._id || i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                        <span>{i + 1}. {p.user?.name || 'Player'}</span>
                        <span style={{ fontWeight: '600' }}>{p.score} pts</span>
                      </div>
                    ))}
                    {t.winner && (
                      <div style={{ marginTop: '8px', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                        🏆 Winner: <strong>{t.winner.name}</strong>
                      </div>
                    )}
                  </div>
                )}

                {t.status === 'upcoming' && !isParticipant(t) && (
                  <button className="btn btn-primary btn-full" onClick={() => joinTournament(t._id)}>
                    Register
                  </button>
                )}
                {isParticipant(t) && (
                  <div style={{ textAlign: 'center', padding: '8px', background: '#d1fae5', borderRadius: '8px', fontSize: '13px', color: '#065f46', fontWeight: '500' }}>
                    ✓ Registered
                  </div>
                )}
              </div>
            ))}
            {tournaments.length === 0 && (
              <div className="empty-card" style={{ gridColumn: '1/-1' }}>
                <p>No tournaments yet. Create the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create tournament</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={createTournament}>
              <div className="form-group"><label>Tournament name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Game *</label>
                <select value={form.game} onChange={e => setForm({...form, game: e.target.value})} required>
                  <option value="">Select game</option>
                  {GAMES.map(g => <option key={g} value={g}>{g.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              <div className="form-group"><label>Venue</label><input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Max players</label><input type="number" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Entry fee (₹)</label><input type="number" value={form.entryFee} onChange={e => setForm({...form, entryFee: parseInt(e.target.value)})} /></div>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
