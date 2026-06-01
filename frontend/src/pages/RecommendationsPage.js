import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecommendationsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentTo, setSentTo] = useState({});
  const [modal, setModal] = useState(null);
  const [reqForm, setReqForm] = useState({ game: '', venue: '', message: '', proposedDate: '', proposedTime: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const ALL_VENUES = ['home','society-clubhouse','local-ground','sports-complex'];
  const formatLabel = (s) => s.replace(/-/g,' ').replace(/\w/g, c => c.toUpperCase());

  useEffect(() => {
    axios.get('/api/recommendations').then(res => {
      setRecs(res.data.recommendations);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openModal = (player) => {
    setSendError('');
    setModal(player);
    setReqForm({ game: player.sharedGames?.[0] || player.preferredGames?.[0] || '', venue: player.preferredVenues?.[0] || ALL_VENUES[0], message: '', proposedDate: '', proposedTime: '' });
  };

  const sendRequest = async () => {
    setSendError('');
    if (!reqForm.game || !reqForm.venue) { setSendError('Please select game and venue'); return; }
    setSending(true);
    try {
      await axios.post('/api/requests', { receiverId: modal._id, ...reqForm });
      setSentTo(prev => ({ ...prev, [modal._id]: true }));
      setModal(null);
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed');
    }
    setSending(false);
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  const stars = (score) => {
    if (!score) return null;
    return '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));
  };

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
        <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>AI Recommendations</h1>
        <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '20px' }}>
          Best matches for you based on your games, availability and skill level
        </p>

        {loading ? <div className="spinner" style={{ margin: '40px auto' }} /> : (
          recs.length === 0 ? (
            <div className="empty-card">
              <p>No recommendations yet.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Complete your profile with games, availability and skill level for better matches.</p>
              <Link to="/profile" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>Complete profile</Link>
            </div>
          ) : (
            <div className="players-grid">
              {recs.map((player, idx) => (
                <div key={player._id} className="player-card" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--primary)', color: '#fff',
                    borderRadius: '100px', padding: '2px 10px', fontSize: '11px', fontWeight: '700' }}>
                    {player.matchScore}% match
                  </div>
                  {idx === 0 && (
                    <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '4px 10px',
                      fontSize: '11px', fontWeight: '600', marginBottom: '8px', display: 'inline-block' }}>
                      🏆 Best match
                    </div>
                  )}
                  <div className="player-card-top">
                    <div className="player-avatar">{initials(player.name)}</div>
                    <div className="player-info">
                      <h3>{player.name}</h3>
                      <p>{player.location?.city || 'Location not set'}</p>
                      <span className={'badge badge-' + player.skillLevel}>{player.skillLevel}</span>
                    </div>
                  </div>
                  {player.bio && <p className="player-bio">{player.bio}</p>}
                  {player.sharedGames?.length > 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '6px', fontWeight: '500' }}>
                      Shared games: {player.sharedGames.join(', ')}
                    </div>
                  )}
                  <div className="player-games">
                    {(player.preferredGames || []).map(g => (
                      <span key={g} className={'chip chip-static chip-sm' + (player.sharedGames?.includes(g) ? ' chip-selected' : '')}>{formatLabel(g)}</span>
                    ))}
                  </div>
                  <button
                    className={'btn btn-primary btn-full' + (sentTo[player._id] ? ' btn-sent' : '')}
                    style={{ marginTop: '12px' }}
                    onClick={() => !sentTo[player._id] && openModal(player)}
                    disabled={sentTo[player._id]}
                  >
                    {sentTo[player._id] ? '✓ Request sent!' : 'Send play request'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request to {modal.name}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            {sendError && <div className="alert alert-error">{sendError}</div>}
            <div className="form-group"><label>Game *</label>
              <select value={reqForm.game} onChange={e => setReqForm({...reqForm, game: e.target.value})}>
                <option value="">Select game</option>
                {(modal.preferredGames || []).map(g => <option key={g} value={g}>{formatLabel(g)}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Venue *</label>
              <select value={reqForm.venue} onChange={e => setReqForm({...reqForm, venue: e.target.value})}>
                <option value="">Select venue</option>
                {ALL_VENUES.map(v => <option key={v} value={v}>{formatLabel(v)}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="date" value={reqForm.proposedDate} onChange={e => setReqForm({...reqForm, proposedDate: e.target.value})} /></div>
              <div className="form-group"><label>Time</label><input type="time" value={reqForm.proposedTime} onChange={e => setReqForm({...reqForm, proposedTime: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Message</label>
              <textarea value={reqForm.message} onChange={e => setReqForm({...reqForm, message: e.target.value})} rows={2} placeholder={'Hey ' + modal.name + ', want to play?'} />
            </div>
            <div className="form-row">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendRequest} disabled={sending}>{sending ? 'Sending...' : 'Send request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
