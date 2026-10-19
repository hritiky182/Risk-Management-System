import React, { useState, useEffect } from 'react';
import { useERM } from '../../context/ERMContext';
import { Search, X, ShieldAlert, ShieldCheck, FileText, AlertOctagon, User } from 'lucide-react';

export function SearchModal() {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    risks,
    controls,
    incidents,
    compliance,
    users,
    setSelectedRiskForDrawer,
    setActiveTab
  } = useERM();

  const [query, setQuery] = useState('');

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen, setGlobalSearchOpen]);

  if (!globalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedRisks = risks.filter(r =>
    !q || r.title.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  ).slice(0, 5);

  const matchedControls = controls.filter(c =>
    !q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedIncidents = incidents.filter(i =>
    !q || i.title.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedCompliance = compliance.filter(c =>
    !q || c.title.toLowerCase().includes(q) || c.framework.toLowerCase().includes(q)
  ).slice(0, 2);

  const handleSelectRisk = (risk) => {
    setSelectedRiskForDrawer(risk);
    setGlobalSearchOpen(false);
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setGlobalSearchOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setGlobalSearchOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: '#ffffff' }}>
          <Search size={20} color="var(--brand-primary)" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search risks, incidents, controls, compliance, personnel... (e.g. Fraud, Lusaka, Solvency, PIA)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: 'var(--text-primary)'
            }}
          />
          <button onClick={() => setGlobalSearchOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '12px 16px', background: '#ffffff' }}>
          {/* Risks Section */}
          {matchedRisks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={14} color="#ea580c" /> Identified Risks ({matchedRisks.length})
              </div>
              {matchedRisks.map(r => (
                <div
                  key={r.id}
                  onClick={() => handleSelectRisk(r)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    transition: 'background 0.15s',
                    marginBottom: 4,
                    border: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--brand-primary)', marginRight: 6 }}>{r.code}</span>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {r.branchName} • {r.category} • Inherent Score: {r.inherentScore}
                    </div>
                  </div>
                  <span className={`badge badge-${r.inherentLevel.toLowerCase()}`}>
                    {r.inherentLevel}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Controls Section */}
          {matchedControls.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#16a34a" /> Controls & Mitigations ({matchedControls.length})
              </div>
              {matchedControls.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleNavigate('controls')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    border: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--brand-primary)', marginRight: 6 }}>{c.code}</span>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {c.type} • Owner: {c.owner}
                    </div>
                  </div>
                  <span className="badge badge-low">{c.designEffectiveness}</span>
                </div>
              ))}
            </div>
          )}

          {/* Incidents Section */}
          {matchedIncidents.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertOctagon size={14} color="#dc2626" /> Loss Incidents ({matchedIncidents.length})
              </div>
              {matchedIncidents.map(i => (
                <div
                  key={i.id}
                  onClick={() => handleNavigate('incidents')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                    border: '1px solid var(--border-subtle)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      <span style={{ color: '#dc2626', marginRight: 6 }}>{i.code}</span>
                      {i.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {i.branchName} • Status: {i.status}
                    </div>
                  </div>
                  <span className="badge badge-critical">{i.severity}</span>
                </div>
              ))}
            </div>
          )}

          {matchedRisks.length === 0 && matchedControls.length === 0 && matchedIncidents.length === 0 && (
            <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching records found for "{query}". Try searching for "Claim", "Lusaka", "PIA", or "Mining".
            </div>
          )}
        </div>

        <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Press <strong>ESC</strong> to close</span>
          <span>Click any record to inspect details</span>
        </div>
      </div>
    </div>
  );
}
