import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await axios.put('/api/notifications/read-all');
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = async (notif) => {
    await axios.put('/api/notifications/' + notif._id + '/read');
    setUnread(prev => Math.max(0, prev - 1));
    setShowDropdown(false);
    if (notif.link) navigate(notif.link);
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return Math.floor(diff/86400) + 'd ago';
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">SportsMatch</div>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/find-partners" className="nav-link">Find</Link>
        <Link to="/recommendations" className="nav-link">For you</Link>
        <Link to="/communities" className="nav-link">Communities</Link>
        <Link to="/tournaments" className="nav-link">Tournaments</Link>
        <Link to="/requests" className="nav-link">Requests</Link>
        {user?.role === 'admin' && <Link to="/admin" className="nav-link" style={{ color: 'var(--primary)' }}>Admin</Link>}

        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => { setShowDropdown(!showDropdown); if (!showDropdown) fetchNotifications(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px 8px', fontSize: '18px' }}
          >
            🔔
            {unread > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--primary)',
                color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: '700',
                padding: '1px 5px', minWidth: '16px', textAlign: 'center' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', right: 0, top: '36px', width: '320px', background: '#fff',
              border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 200, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--primary)',
                    background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray)', fontSize: '13px' }}>
                    No notifications yet
                  </div>
                ) : notifications.map(n => (
                  <div key={n._id} onClick={() => handleNotifClick(n)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      background: n.read ? '#fff' : '#fff5f1', transition: 'background 0.15s' }}>
                    <div style={{ fontWeight: n.read ? '400' : '600', fontSize: '13px', marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '2px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)' }}>{timeAgo(n.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="nav-link">
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700' }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'}
          </div>
        </Link>
        <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
