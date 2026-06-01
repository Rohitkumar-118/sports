import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RequestsPage = () => {
  const { logout } = useAuth();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/requests');
      setReceived(res.data.received);
      setSent(res.data.sent);
    } catch (err) {
      setError('Failed to load requests - make sure backend is running');
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put('/api/requests/' + id, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      await axios.delete('/api/requests/' + id);
      fetchRequests();
    } catch (err) {
      alert('Failed to cancel');
    }
  };

  const initials = (name) => name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const RequestCard = ({ req, type }) => {
    const other = type === 'received' ? req.sender : req.receiver;
    return (
      <div className={'request-card status-' + req.status}>
        <div className="request-card-top">
          <div className="player-avatar player-avatar-sm">{initials(other?.name)}</div>
          <div className="request-info">
            <h3>{other?.name || 'Unknown'}</h3>
            <p>{type === 'received' ? 'wants to play with you' : 'request sent'}</p>
          </div>
          <span className={'req-badge req-badge-' + req.status}>{req.status}</span>
        </div>
        <div className="request-details">
          <span><strong>Game:</strong> {req.game?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
          <span><strong>Venue:</strong> {req.venue?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
          {req.proposedDate && <span><strong>Date:</strong> {req.proposedDate}</span>}
          {req.proposedTime && <span><strong>Time:</strong> {req.proposedTime}</span>}
        </div>
        {req.message && <p className="request-message">"{req.message}"</p>}
        <p className="request-meta">{new Date(req.createdAt).toLocaleDateString()}</p>
        {req.status === 'pending' && type === 'received' && (
          <div className="form-row" style={{ marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => handleAction(req._id, 'declined')}>Decline</button>
            <button className="btn btn-primary" onClick={() => handleAction(req._id, 'accepted')}>Accept</button>
          </div>
        )}
        {req.status === 'pending' && type === 'sent' && (
          <button className="btn btn-outline btn-full" style={{ marginTop: '12px' }} onClick={() => handleCancel(req._id)}>
            Cancel request
          </button>
        )}
        {req.status === 'accepted' && (
          <div className="accepted-banner">Match confirmed! Meet and play.</div>
        )}
      </div>
    );
  };

  const currentList = tab === 'received' ? received : sent;

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-body">
        <h1 style={{ marginBottom: '20px', fontSize: '22px' }}>Play requests</h1>
        <div className="tab-row">
          <button className={'tab-btn' + (tab === 'received' ? ' tab-active' : '')} onClick={() => setTab('received')}>
            Received
            {received.filter((r) => r.status === 'pending').length > 0 && (
              <span className="tab-badge">{received.filter((r) => r.status === 'pending').length}</span>
            )}
          </button>
          <button className={'tab-btn' + (tab === 'sent' ? ' tab-active' : '')} onClick={() => setTab('sent')}>
            Sent
          </button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : currentList.length === 0 ? (
          <div className="empty-card">
            <p>{tab === 'received' ? 'No requests received yet.' : 'No requests sent yet.'}</p>
            {tab === 'sent' && (
              <Link to="/find-partners" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
                Find partners
              </Link>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {currentList.map((req) => <RequestCard key={req._id} req={req} type={tab} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
