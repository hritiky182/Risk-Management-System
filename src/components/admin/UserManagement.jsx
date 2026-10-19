import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import { Users, Building2, Shield, UserPlus, CheckCircle, Mail, MapPin } from 'lucide-react';

export function UserManagement() {
  const { users, branches, currentUser, setCurrentUser, showToast } = useERM();

  const [activeAdminTab, setActiveAdminTab] = useState('users'); // 'users' | 'branches' | 'roles'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Users, Roles & Branch Hierarchy (Sections 1.4 - 1.7)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage user accounts, assign roles and branches, and configure fine-grained role-based access control.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeAdminTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('users')}
        >
          <Users size={16} />
          <span>Active Personnel & User Accounts ({users.length})</span>
        </button>
        <button
          className={`tab-btn ${activeAdminTab === 'branches' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('branches')}
        >
          <Building2 size={16} />
          <span>Branch Network ({branches.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeAdminTab === 'users' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Name & Email</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Branch Assignment</th>
                <th>Status</th>
                <th>Permissions</th>
                <th>Switch To User</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--brand-primary), #0284c7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#fff'
                        }}
                      >
                        {u.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{u.role}</span>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.branchName}</td>
                  <td>
                    <span className="badge badge-low">{u.status}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {(u.permissions || []).length} Granted Policies
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${currentUser.id === u.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        setCurrentUser(u);
                        showToast('Session Updated', `Switched active user to ${u.name} (${u.role})`, 'info');
                      }}
                    >
                      {currentUser.id === u.id ? 'Active Session' : 'Login As'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: BRANCHES */}
      {activeAdminTab === 'branches' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {branches.map(b => (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)' }}>
                    BRANCH CODE: {b.code}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                    {b.name}
                  </h3>
                </div>
                <span className={`badge ${b.riskRating === 'Critical' ? 'badge-critical' : b.riskRating === 'High' ? 'badge-high' : 'badge-low'}`}>
                  {b.riskRating} Risk
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="var(--brand-primary)" />
                  <span>{b.location} ({b.region})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                  <Shield size={14} color="#16a34a" />
                  <span>Branch Manager: <strong style={{ color: 'var(--text-primary)' }}>{b.manager}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <span>Staff Headcount: <strong style={{ color: 'var(--text-primary)' }}>{b.staffCount}</strong></span>
                  <span>RCSA: <strong style={{ color: 'var(--brand-primary)' }}>{b.rcsaStatus}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
