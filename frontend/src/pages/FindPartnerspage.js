import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ALL_GAMES = [
  'chess', 'carrom', 'cards', 'badminton',
  'table-tennis', 'cricket', 'football', 'volleyball',
];

const ALL_VENUES = [
  'home', 'society-clubhouse', 'local-ground', 'sports-complex',
];

const GAME_FILTERS = [
  { id: '', label: 'All games' },
  { id: 'chess', label: 'Chess' },
  { id: 'carrom', label: 'Carrom' },
  { id: 'cards', label: 'Cards' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'table-tennis', label: 'Table Tennis' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'football', label: 'Football' },
  { id: 'volleyball', label: 'Volleyball' },
];

const SKILL_FILTERS = [
  { id: '', label: 'Any level' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const formatLabel = (str) =>
  str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const FindPartnersPage = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    game: '', skill: '', city: user?.location?.city || '',
  });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState(null);
  const [reqForm, setReqForm] = useState({
    game: '', venue: '', message: '', proposedDate: '', proposedTime: '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sentTo, setSentTo] = useState({});

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.game) params.game = filters.game;
      if (filters.skill) params.skill = filters.skill;
      if (filters.city) params.city = filters.city;
      const res = await axios.get('/api/search', { params });
      setPlayers(res.data.users || []);
      setSearched(true);
    } catch (err) {
      setError('Search failed: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  useEffect(() => { handleSearch(); }, []);

  const openModal = (player) => {
    setSendError('');
    setModal(player);
    // Pre-fill game: use player's first preferred game, else first in ALL_GAMES
    const defaultGame =
      (player.preferredGames && player.preferredGames.length > 0)
        ? player.preferredGames[0]
        : ALL_GAMES[0];
    // Pre-fill venue: use player's first preferred venue, else first in ALL_VENUES
    const defaultVenue =
      (player.preferredVenues && player.preferredVenues.length > 0)
        ? player.preferredVenues[0]
        : ALL_VENUES[0];
    setReqForm({
      game: defaultGame,
      venue: defaultVenue,
      message: '',
      proposedDate: '',
      proposedTime: '',
    });
  };

  const sendRequest = async () => {
    setSendError('');
    if (!reqForm.game) { setSendError('Please select a game'); return; }
    if (!reqForm.venue) { setSendError('Please select a venue'); return; }

    setSending(true);
    try {
      await axios.post('/api/requests', {
        receiverId: modal._id,
        game: reqForm.game,
        venue: reqForm.venue,
        message: reqForm.message,
        proposedDate: reqForm.proposedDate,
        proposedTime: reqForm.proposedTime,
      });
      setSentTo((prev) => ({ ...prev, [modal._id]: true }));
      setModal(null);
      setSendError('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send request';
      setSendError(msg);
    }
    setSending(false);
  };

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-body">
        <h1 style={{ marginBottom: '20px', fontSize: '22px' }}>Find game partners</h1>

        <form onSubmit={handleSearch} className="search-bar">
          <select value={filters.game} onChange={(e) => setFilters({ ...filters, game: e.target.value })}>
            {GAME_FILTERS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
          <select value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })}>
            {SKILL_FILTERS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <input
            placeholder="City / area..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {searched && !loading && (
          <p style={{ color: 'var(--gray)', fontSize: '14px', margin: '16px 0 8px' }}>
            {players.length === 0
              ? 'No players found. Try different filters or remove city filter.'
              : players.length + ' player(s) found'}
          </p>
        )}

        <div className="players-grid">
          {players.map((player) => (
            <div key={player._id} className="player-card">
              <div className="player-card-top">
                <div className="player-avatar">{initials(player.name)}</div>
                <div className="player-info">
                  <h3>{player.name}</h3>
                  <p>{player.location?.city || 'Location not set'}</p>
                  <span className={'badge badge-' + player.skillLevel}>{player.skillLevel}</span>
                </div>
              </div>
              {player.bio && <p className="player-bio">{player.bio}</p>}
              <div className="player-games">
                {(player.preferredGames || []).map((g) => (
                  <span key={g} className="chip chip-static chip-sm">{formatLabel(g)}</span>
                ))}
              </div>
              {(player.availability?.days || []).length > 0 && (
                <div className="player-avail">
                  <span className="avail-label">Available: </span>
                  {player.availability.days.map((d) => (
                    <span key={d} className="chip chip-static chip-sm">{d.slice(0, 3).toUpperCase()}</span>
                  ))}
                </div>
              )}
              <button
                className={'btn btn-primary btn-full' + (sentTo[player._id] ? ' btn-sent' : '')}
                style={{ marginTop: '12px' }}
                onClick={() => { if (!sentTo[player._id]) openModal(player); }}
                disabled={sentTo[player._id]}
              >
                {sentTo[player._id] ? '✓ Request sent!' : 'Send play request'}
              </button>
            </div>
          ))}
        </div>

        {players.length === 0 && searched && !loading && (
          <div className="empty-card">
            <p>No players found matching your filters.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Try clearing the city filter or register more users.
            </p>
          </div>
        )}
      </div>

      {/* Send Request Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request to {modal.name}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {sendError && (
              <div className="alert alert-error" style={{ marginBottom: '8px' }}>
                {sendError}
              </div>
            )}

            <div className="form-group">
              <label>Game <span className="required">*</span></label>
              <select
                value={reqForm.game}
                onChange={(e) => setReqForm({ ...reqForm, game: e.target.value })}
              >
                <option value="">-- Select game --</option>
                {/* Show player's preferred games first, then all others */}
                {(modal.preferredGames && modal.preferredGames.length > 0
                  ? modal.preferredGames
                  : ALL_GAMES
                ).map((g) => (
                  <option key={g} value={g}>{formatLabel(g)}</option>
                ))}
                {/* Add remaining games not in their list */}
                {modal.preferredGames && modal.preferredGames.length > 0 &&
                  ALL_GAMES.filter((g) => !modal.preferredGames.includes(g)).map((g) => (
                    <option key={g} value={g}>{formatLabel(g)}</option>
                  ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Venue <span className="required">*</span></label>
              <select
                value={reqForm.venue}
                onChange={(e) => setReqForm({ ...reqForm, venue: e.target.value })}
              >
                <option value="">-- Select venue --</option>
                {ALL_VENUES.map((v) => (
                  <option key={v} value={v}>{formatLabel(v)}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Proposed date</label>
                <input
                  type="date"
                  value={reqForm.proposedDate}
                  onChange={(e) => setReqForm({ ...reqForm, proposedDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Proposed time</label>
                <input
                  type="time"
                  value={reqForm.proposedTime}
                  onChange={(e) => setReqForm({ ...reqForm, proposedTime: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message (optional)</label>
              <textarea
                placeholder={'Hey ' + modal.name + ', want to play?'}
                value={reqForm.message}
                onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })}
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="form-row">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendRequest} disabled={sending}>
                {sending ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPartnersPage;
