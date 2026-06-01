import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const GAME_ICONS = {
  chess: '♟', carrom: '🎯', cards: '🃏', badminton: '🏸',
  'table-tennis': '🏓', cricket: '🏏', football: '⚽', volleyball: '🏐',
};

const QUICK_ACTIONS = [
  { to: '/find-partners',   icon: '🔍', label: 'Find partners',     desc: 'Search nearby players'          },
  { to: '/requests',        icon: '📨', label: 'Play requests',     desc: 'Manage sent & received'         },
  { to: '/recommendations', icon: '🤖', label: 'AI for you',        desc: 'Smart match suggestions'        },
  { to: '/communities',     icon: '👥', label: 'Communities',       desc: 'Join society groups'            },
  { to: '/tournaments',     icon: '🏆', label: 'Tournaments',       desc: 'Compete & win'                  },
  { to: '/profile',         icon: '✏️', label: 'Edit profile',      desc: 'Update games & availability'   },
];

const DashboardPage = () => {
  const { user } = useAuth();

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const profileComplete = [
    user?.preferredGames?.length > 0,
    user?.location?.city,
    user?.availability?.days?.length > 0,
    user?.skillLevel,
  ].filter(Boolean).length;

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-body">

        {/* Welcome banner */}
        <div className="welcome-banner">
          <div className="welcome-avatar">{initials}</div>
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Ready to find your next game partner?</p>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
              Admin panel
            </Link>
          )}
        </div>

        {/* Profile completeness */}
        <div className="completeness-card">
          <div className="completeness-header">
            <span>Profile completeness</span>
            <strong>{profileComplete}/4</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: (profileComplete / 4 * 100) + '%' }} />
          </div>
          {profileComplete < 4 && (
            <p className="completeness-hint">
              Complete your profile for better matches. <Link to="/profile">Update now</Link>
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">🎮</span>
            <div>
              <div className="stat-value">{user?.preferredGames?.length || 0}</div>
              <div className="stat-label">Games selected</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <div className="stat-value">{user?.availability?.days?.length || 0}</div>
              <div className="stat-label">Days available</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏅</span>
            <div>
              <div className="stat-value" style={{ textTransform: 'capitalize' }}>{user?.skillLevel || '—'}</div>
              <div className="stat-label">Skill level</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🕹</span>
            <div>
              <div className="stat-value">{user?.playHistory?.length || 0}</div>
              <div className="stat-label">Matches played</div>
            </div>
          </div>
        </div>

        {/* Your games */}
        {user?.preferredGames?.length > 0 && (
          <div className="section-card">
            <h2>Your games</h2>
            <div className="games-grid">
              {user.preferredGames.map((g) => (
                <div key={g} className="game-tile">
                  <span className="game-tile-icon">{GAME_ICONS[g] || '🎲'}</span>
                  <span>{g.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions - all 6 features */}
        <div className="section-card">
          <h2>Quick actions</h2>
          <div className="actions-grid-full">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.to} to={action.to} className="action-card">
                <span style={{ fontSize: '26px' }}>{action.icon}</span>
                <strong>{action.label}</strong>
                <p>{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
