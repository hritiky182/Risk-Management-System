import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Key,
  X
} from 'lucide-react';

export function LoginPage() {
  const { users, login } = useERM();

  const [email, setEmail] = useState('m.mwamba@test.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Quick Persona selector
  const handleSelectPersona = (user) => {
    setEmail(user.email);
    setPassword('APEX-ERM-2026!');
    setErrorMessage('');
    handleDirectLogin(user);
  };

  const handleDirectLogin = (user) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(user, rememberMe);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your corporate email or employee ID.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by email (case-insensitive)
      const matchedUser = users.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matchedUser) {
        setIsLoading(false);
        login(matchedUser, rememberMe);
      } else {
        // Fallback: If user entered another email, log in with first user
        const fallback = users[0];
        setIsLoading(false);
        login(fallback, rememberMe);
      }
    }, 450);
  };

  return (
    <div className="login-page-container">
      <div className="login-card-centered">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <Shield size={28} color="#ffffff" />
          </div>
          <h1 className="login-brand-title">Apex General Insurance</h1>
          <p className="login-brand-subtitle">Enterprise Risk Management System (ERMS)</p>
          <div className="login-terminal-tag">
            <span className="live-dot" />
            <span>Secure Enterprise Workspace</span>
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="var(--brand-primary)" />
              <span>Corporate Email or Employee ID</span>
            </label>
            <div className="login-input-wrapper" style={{ position: 'relative', width: '100%' }}>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@test.com"
                required
                style={{ width: '100%', height: 44, fontSize: 13.5, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <Lock size={13} color="var(--brand-primary)" />
                <span>Password</span>
              </label>
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => setForgotModalOpen(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="login-input-wrapper" style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ width: '100%', height: 44, fontSize: 13.5, paddingRight: 44, boxSizing: 'border-box' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span>Remember this terminal session</span>
            </label>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Instant Role-Based Demo Access */}
        <div className="demo-roles-section">
          <div className="demo-roles-divider">
            <span>OR ONE-CLICK DEMO ACCESS</span>
          </div>

          <div className="demo-roles-grid">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                className="demo-role-card"
                onClick={() => handleSelectPersona(u)}
                title={`Sign in immediately as ${u.name} (${u.role})`}
              >
                <div className="demo-role-avatar">{u.avatar}</div>
                <div className="demo-role-meta">
                  <div className="demo-role-name">{u.name}</div>
                  <div className="demo-role-badge">{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security & Trust Footer */}
        <div className="login-footer">
          <div className="login-security-tag">
            <ShieldCheck size={13} color="var(--color-primary)" />
            <span>256-Bit TLS Encryption · ISO 31000 Compliant · RBAC Protected</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Simulated Modal */}
      {forgotModalOpen && (
        <div className="modal-backdrop" onClick={() => setForgotModalOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={18} color="var(--color-primary)" />
                <h3 className="modal-title">Password Assistance</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setForgotModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p>
                User accounts are synchronized with Active Directory / Azure AD single sign-on.
              </p>
              <div style={{ margin: '14px 0', background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div><strong>IT Service Desk:</strong> ext. 4410</div>
                <div><strong>Security Operations:</strong> sec-ops@test.com</div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                  For demonstration, please click any of the One-Click Demo Personas on the login card to immediately enter the system.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
