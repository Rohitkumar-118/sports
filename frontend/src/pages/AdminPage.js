import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { logout } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    const res = await axios.get('/api/admin/stats');
    setStats(res.data.stats);
  };

  const fetchUsers = async (q = '') => {
    setLoading(true);
    const res = await axios.get('/api/admin/users', { params: { search: q } });
    setUsers(res.data.users);
    setLoading(false);
  };

  const fetchRequests = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/requests');
    setRequests(res.data.requests);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    if (tab === 'users') fetchUsers(search);
    if (tab === 'requests') fetchRequests();
  }, [tab]);

  const toggleUser = async (id) => {
    await axios.put('/api/admin/users/' + id + '/toggle');
    fetchUsers(search);
  };

  const changeRole = async (id, role) => {
    await axios.put('/api/admin/users/' + id + '/role', { role });
    fetchUsers(search);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await axios.delete('/api/admin/users/' + id);
    fetchUsers(search);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">SportsMatch Admin</div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">App</Link>
          <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-body">
        <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>Admin Dashboard</h1>

        {stats && (
          <div className="stats-row" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total users', value: stats.totalUsers },
              { label: 'Active users', value: stats.activeUsers },
              { label: 'Total requests', value: stats.totalRequests },
              { label: 'Matches made', value: stats.acceptedRequests },
              { label: 'Tournaments', value: stats.totalTournaments },
              { label: 'Communities', value: stats.totalCommunities },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="tab-row">
          {['users', 'requests'].map((t) => (
            <button key={t} className={'tab-btn' + (tab === t ? ' tab-active' : '')} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', margin: '16px 0' }}>
              <input placeholder="Search by name or email..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search)}
                style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => fetchUsers(search)}>Search</button>
            </div>
            {loading ? <div className="spinner" /> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      {['Name', 'Email', 'Role', 'Status', 'Games', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 8px', color: 'var(--gray)', fontWeight: '500' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--gray)' }}>{u.email}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px' }}>
                            <option value="user">User</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '600',
                            background: u.isActive ? '#d1fae5' : '#fee2e2',
                            color: u.isActive ? '#065f46' : '#991b1b' }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--gray)' }}>
                          {(u.preferredGames || []).slice(0,2).join(', ')}{u.preferredGames?.length > 2 ? '...' : ''}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => toggleUser(u._id)}
                              style={{ padding: '4px 10px', fontSize: '12px' }}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteUser(u._id)}
                              style={{ padding: '4px 10px', fontSize: '12px', background: '#fee2e2',
                                color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div>
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    {['From', 'To', 'Game', 'Venue', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 8px', color: 'var(--gray)', fontWeight: '500' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 8px' }}>{r.sender?.name}</td>
                      <td style={{ padding: '10px 8px' }}>{r.receiver?.name}</td>
                      <td style={{ padding: '10px 8px' }}>{r.game}</td>
                      <td style={{ padding: '10px 8px' }}>{r.venue?.replace(/-/g,' ')}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={'req-badge req-badge-' + r.status}>{r.status}</span>
                      </td>
                      <td style={{ padding: '10px 8px', color: 'var(--gray)' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
