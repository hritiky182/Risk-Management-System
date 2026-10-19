import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Search,
  Bell,
  RotateCcw,
  Building2,
  UserCheck,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';

export function Header() {
  const {
    currentUser,
    setCurrentUser,
    users,
    branches,
    currentBranchFilter,
    setCurrentBranchFilter,
    notifications,
    setNotifications,
    setGlobalSearchOpen,
    resetDemoData,
    showToast,
    runAIUniverseScan,
    logout
  } = useERM();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleChange = (e) => {
    const selected = users.find(u => u.role === e.target.value);
    if (selected) {
      setCurrentUser(selected);
      showToast('Role Switched', `Active session updated to: ${selected.role} (${selected.name})`, 'info');
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="header">
      {/* Left: Organization context & Branch Filter */}
      <div className="header-left">
        <div className="branch-selector">
          <Building2 size={16} color="var(--brand-primary)" />
          <select
            value={currentBranchFilter}
            onChange={e => setCurrentBranchFilter(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 12.5,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">
              All Branches (Consolidated Apex)
            </option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Global Search Button */}
        <button
          className="quick-search-btn"
          onClick={() => setGlobalSearchOpen(true)}
          title="Search risks, controls, incidents (Ctrl+K)"
        >
          <Search size={14} color="var(--brand-primary)" />
          <span>Quick search...</span>
          <span className="search-kbd">⌘K</span>
        </button>
      </div>

      {/* Right: Actions, AI Trigger, Role Switcher, Notifications, Demo Reset */}
      <div className="header-right">
        {/* Quick AI Universe Scan Button */}
        <button
          className="btn btn-ai btn-sm"
          onClick={runAIUniverseScan}
          title="Run grounded AI anomaly scan across risk database"
        >
          <Sparkles size={14} />
          <span>AI Scan</span>
        </button>

        {/* Role Switcher Pill */}
        <div className="role-switcher-pill" title="Demonstrate Role-Based Access Control">
          <UserCheck size={14} color="var(--brand-primary)" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Role:</span>
          <select
            className="role-switcher-select"
            value={currentUser.role}
            onChange={handleRoleChange}
          >
            {users.map(u => (
              <option key={u.id} value={u.role}>
                {u.role} ({u.name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="System Notifications & Alerts"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: 'absolute',
                top: 45,
                right: 0,
                width: 320,
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      background: n.read ? '#f8fafc' : '#f0f9ff',
                      border: '1px solid',
                      borderColor: n.read ? 'var(--border-subtle)' : '#bae6fd',
                      fontSize: 12
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={resetDemoData}
          title="Restore pristine sample database for technical evaluation"
          style={{ borderColor: '#fecaca', color: '#b91c1c', background: '#fff5f5' }}
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
        </button>

        {/* Current User Profile Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 8,
            borderLeft: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12.5,
              color: '#ffffff',
              boxShadow: 'var(--brand-glow)'
            }}
          >
            {currentUser.avatar}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {currentUser?.name || 'User'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {currentUser?.department || ''}
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            title="Sign out of ERMS session"
            style={{
              padding: '5px 10px',
              fontSize: 11.5,
              fontWeight: 600,
              gap: 5,
              marginLeft: 4,
              borderColor: 'var(--border-subtle)',
              color: '#64748b'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
