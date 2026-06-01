import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CommunitiesPage = () => {
  const { user, logout } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSession, setShowSession] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', games: '', city: '' });
  const [sessionForm, setSessionForm] = useState({ title: '', game: '', venue: '', date: '', time: '', maxPlayers: 10 });
  const [joined, setJoined] = useState({});
  const [error, setError] = useState('');

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/communities');
      setCommunities(res.data.communities);
    } catch (e) { setError('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchCommunities(); }, []);

  const createCommunity = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/communities', { ...form, games: form.games.split(',').map(g => g.trim()).filter(Boolean) });
      setShowCreate(false);
      setForm({ name: '', description: '', games: '', city: '' });
      fetchCommunities();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const joinCommunity = async (id) => {
    try {
      await axios.post('/api/communities/' + id + '/join');
      setJoined(prev => ({ ...prev, [id]: true }));
      fetchCommunities();
    } catch (err) { alert(err.response?.data?.message || 'Failed to join'); }
  };

  const addSession = async (communityId) => {
    try {
      await axios.post('/api/communities/' + communityId + '/sessions', sessionForm);
      setShowSession(null);
      setSessionForm({ title: '', game: '', venue: '', date: '', time: '', maxPlayers: 10 });
      fetchCommunities();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const joinSession = async (communityId, sessionId) => {
    try {
      await axios.post('/api/communities/' + communityId + '/sessions/' + sessionId + '/join');
      fetchCommunities();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const isMember = (community) => community.members?.some(m => (m._id || m) === user?._id);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">SportsMatch</div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Home</Link>
          <Link to="/find-partners" className="nav-link">Find partners</Link>
          <Link to="/tournaments" className="nav-link">Tournaments</Link>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px' }}>Communities</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create community</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
          <div className="players-grid">
            {communities.map((c) => (
              <div key={c._id} className="player-card">
                <div style={{ marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{c.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--gray)' }}>{c.location?.city} • {c.members?.length || 0} members</p>
                  <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px' }}>
                    Organizer: {c.organizer?.name}
                  </p>
                </div>
                {c.description && <p style={{ fontSize: '13px', marginBottom: '8px' }}>{c.description}</p>}
                <div className="player-games" style={{ marginBottom: '10px' }}>
                  {(c.games || []).map(g => <span key={g} className="chip chip-static chip-sm">{g}</span>)}
                </div>

                {c.sessions?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray)' }}>UPCOMING SESSIONS</p>
                    {c.sessions.map(s => (
                      <div key={s._id} style={{ background: 'var(--gray-light)', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', fontSize: '13px' }}>
                        <div style={{ fontWeight: '500' }}>{s.title} — {s.game}</div>
                        <div style={{ color: 'var(--gray)' }}>{s.date} {s.time} • {s.venue?.replace(/-/g,' ')}</div>
                        <div style={{ color: 'var(--gray)' }}>{s.participants?.length || 0}/{s.maxPlayers} players</div>
                        <button className="btn btn-outline" style={{ marginTop: '6px', padding: '4px 12px', fontSize: '12px' }}
                          onClick={() => joinSession(c._id, s._id)}>
                          Join session
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  {c.organizer?._id === user?._id ? (
                    <button className="btn btn-outline btn-full" onClick={() => setShowSession(c._id)}>
                      + Add session
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-full" onClick={() => joinCommunity(c._id)}>
                      Join community
                    </button>
                  )}
                </div>
              </div>
            ))}
            {communities.length === 0 && (
              <div className="empty-card" style={{ gridColumn: '1/-1' }}>
                <p>No communities yet. Create the first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create community</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={createCommunity}>
              <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              <div className="form-group"><label>Games (comma separated)</label><input value={form.games} onChange={e => setForm({...form, games: e.target.value})} placeholder="chess, badminton, cricket" /></div>
              <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="form-row">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSession && (
        <div className="modal-overlay" onClick={() => setShowSession(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add play session</h2>
              <button className="modal-close" onClick={() => setShowSession(null)}>✕</button>
            </div>
            <div className="form-group"><label>Session title</label><input value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} placeholder="Sunday chess morning" /></div>
            <div className="form-group"><label>Game</label><input value={sessionForm.game} onChange={e => setSessionForm({...sessionForm, game: e.target.value})} /></div>
            <div className="form-group"><label>Venue</label><input value={sessionForm.venue} onChange={e => setSessionForm({...sessionForm, venue: e.target.value})} /></div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} /></div>
              <div className="form-group"><label>Time</label><input type="time" value={sessionForm.time} onChange={e => setSessionForm({...sessionForm, time: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Max players</label><input type="number" value={sessionForm.maxPlayers} onChange={e => setSessionForm({...sessionForm, maxPlayers: e.target.value})} /></div>
            <div className="form-row">
              <button className="btn btn-outline" onClick={() => setShowSession(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => addSession(showSession)}>Add session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;
