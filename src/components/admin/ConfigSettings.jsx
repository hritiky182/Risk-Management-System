import React from 'react';
import { useERM } from '../../context/ERMContext';
import { Sliders, Save, RotateCcw, Shield, CheckCircle, Database } from 'lucide-react';

export function ConfigSettings() {
  const { config, setConfig, resetDemoData, showToast } = useERM();

  const handleUpdate = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    showToast('Setting Saved', `Configuration for ${key} updated.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Administration & Risk Methodology Configuration (Section 14)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Configurable enterprise calculation rules, risk matrix thresholds, appetite tolerance, and demonstration assumptions.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={resetDemoData} style={{ color: '#dc2626' }}>
          <RotateCcw size={15} />
          <span>Restore Sample Data (Demo Reset)</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Card 1: Scoring Formula Configuration (Task 3.4 & 14.2) */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <Sliders size={18} color="var(--brand-primary)" />
            <span>Residual Risk Calculation Engine Formula</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Calculation Model</label>
              <select
                className="form-select"
                value={config.scoringFormula}
                onChange={e => handleUpdate('scoringFormula', e.target.value)}
              >
                <option value="linear">Linear Model: Inherent × (1 - Control Eff %)</option>
                <option value="dampened">Dampened Model (ISO 31000 Standard): Residual Floor Safeguard</option>
              </select>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Tender Note: Calculation formula is completely configurable. Linear formula yields 8/25 residual for 20 inherent with 60% control.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Risk Tolerance Warning Threshold (Score &gt;)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="5"
                  max="15"
                  value={config.riskToleranceThreshold}
                  onChange={e => handleUpdate('riskToleranceThreshold', Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ea580c' }}
                />
                <strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>{config.riskToleranceThreshold}</strong>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Residual risks exceeding this score trigger "Exceeds Threshold" warnings.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Auto-Escalation Critical Threshold (Score &ge;)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={config.autoEscalateScore}
                  onChange={e => handleUpdate('autoEscalateScore', Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#dc2626' }}
                />
                <strong style={{ color: '#dc2626', fontSize: 16 }}>{config.autoEscalateScore}</strong>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Risks assessed at or above this score are automatically routed to Board Risk Committee.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Enterprise Metadata & Currency */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <Database size={18} color="#16a34a" />
            <span>Organization & Demonstration Environment</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Enterprise Entity Name</label>
              <input
                type="text"
                className="form-input"
                value={config.clientName}
                onChange={e => handleUpdate('clientName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <input
                type="text"
                className="form-input"
                value={config.defaultCurrency}
                disabled
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Zambian Kwacha (ZMW)
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Active Audit Cycle</label>
              <input
                type="text"
                className="form-input"
                value={`${config.currentYear} - ${config.activeQuarter}`}
                disabled
              />
            </div>

            <div style={{ marginTop: 10, padding: 12, background: 'var(--brand-tint)', borderRadius: 8, border: '1px solid #bfdbfe' }}>
              <strong style={{ fontSize: 12, color: 'var(--brand-primary)' }}>Client Technical Demonstration Note:</strong>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                Every setting, formula, risk category, and workflow in this environment is persisted in local reactive storage. All calculations dynamically recalculate without hardcoded figures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
