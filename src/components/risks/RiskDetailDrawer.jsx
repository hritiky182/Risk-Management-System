import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  History,
  FileText,
  Sliders,
  Sparkles,
  CheckCircle,
  Plus,
  ArrowRight,
  Printer
} from 'lucide-react';
import { formatZMW, formatDate, getRiskLevel } from '../../utils/formatters';
import { calcInherentRisk, calcResidualRisk, evaluateTolerance } from '../../utils/calculations';

export function RiskDetailDrawer() {
  const {
    selectedRiskForDrawer,
    setSelectedRiskForDrawer,
    updateRisk,
    controls,
    mitigations,
    incidents,
    addMitigation,
    showToast,
    config
  } = useERM();

  const [activeTab, setActiveTab] = useState('scoring'); // scoring | controls | mitigations | incidents | history

  if (!selectedRiskForDrawer) return null;

  const risk = selectedRiskForDrawer;

  // Local state for interactive editing sliders
  const [likelihood, setLikelihood] = useState(risk.inherentLikelihood);
  const [impact, setImpact] = useState(risk.inherentImpact);
  const [effectiveness, setEffectiveness] = useState(risk.controlEffectiveness);

  // Compute live preview calculations
  const liveInherent = calcInherentRisk(likelihood, impact);
  const liveResidual = calcResidualRisk(liveInherent.score, effectiveness, config.scoringFormula);
  const liveTolerance = evaluateTolerance(liveResidual.score, config.riskToleranceThreshold);

  // Get linked items
  const linkedControlsList = controls.filter(c =>
    (risk.linkedControlIds || []).includes(c.id) || (risk.linkedControlIds || []).includes(c.code)
  );

  const linkedMitigationsList = mitigations.filter(m =>
    m.riskId === risk.id || m.riskCode === risk.code || (risk.linkedMitigationIds || []).includes(m.id) || (risk.linkedMitigationIds || []).includes(m.code)
  );

  const linkedIncidentsList = incidents.filter(i =>
    i.linkedRiskId === risk.id || i.linkedRiskId === risk.code || (risk.linkedIncidentIds || []).includes(i.id)
  );

  // Save changes handler
  const handleSaveScoring = () => {
    updateRisk(risk.id, {
      inherentLikelihood: likelihood,
      inherentImpact: impact,
      controlEffectiveness: effectiveness
    });
    showToast('Assessment Updated', `Recalculated scores: Inherent ${liveInherent.score}/25, Residual ${liveResidual.score}/25`, 'success');
  };

  // AI Suggest Controls
  const handleAiSuggestControls = () => {
    showToast('AI Control Synthesis', `Analyzing risk factors for ${risk.title}...`, 'info');
    setTimeout(() => {
      showToast('AI Recommendation', `Recommended 2 preventative controls: "Automated Claims Anomaly Scorer" & "Independent Vendor Verification".`, 'success');
    }, 800);
  };

  // Quick escalate
  const handleEscalate = () => {
    updateRisk(risk.id, { status: 'Escalated' });
    showToast('Risk Escalated', `${risk.code} escalated to Board Risk Committee and Executive Management.`, 'warning');
  };

  const handleApprove = () => {
    updateRisk(risk.id, { status: 'Approved' });
    showToast('Risk Approved', `${risk.code} verified and confirmed in Corporate Risk Register.`, 'success');
  };

  return (
    <>
      <div className="drawer-overlay" onClick={() => setSelectedRiskForDrawer(null)} />
      <div className="drawer-panel">
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary)' }}>
                {risk.code}
              </span>
              <span className={`badge badge-${risk.residualLevel?.toLowerCase() || 'medium'}`}>
                Residual: {risk.residualLevel} ({risk.residualScore}/25)
              </span>
              <span className={`badge badge-${risk.status === 'Escalated' ? 'critical' : 'info'}`}>
                {risk.status}
              </span>
              <span className="badge badge-muted">{risk.branchName}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {risk.title}
            </h2>
          </div>

          <button
            onClick={() => setSelectedRiskForDrawer(null)}
            className="header-icon-btn"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 24px', background: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="tab-list" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${activeTab === 'scoring' ? 'active' : ''}`}
              onClick={() => setActiveTab('scoring')}
            >
              <Sliders size={15} />
              <span>Assessment & Scoring</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
              onClick={() => setActiveTab('controls')}
            >
              <ShieldCheck size={15} />
              <span>Controls ({linkedControlsList.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'mitigations' ? 'active' : ''}`}
              onClick={() => setActiveTab('mitigations')}
            >
              <TrendingUp size={15} />
              <span>Mitigation Plans ({linkedMitigationsList.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveTab('incidents')}
            >
              <AlertTriangle size={15} />
              <span>Incidents ({linkedIncidentsList.length})</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={15} />
              <span>Assessment History</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
          {activeTab === 'scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Summary Description Box */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Risk Description & Context
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>
                  {risk.description}
                </p>
                <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap', fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Category: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{risk.category}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Subcategory: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{risk.subcategory}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Risk Owner: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{risk.owner}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Financial Exposure: </span>
                    <strong style={{ color: 'var(--brand-primary)' }}>{formatZMW(risk.financialExposureZMW)}</strong>
                  </div>
                </div>
              </div>

              {/* Interactive Scoring Matrix Playground (Tender Task 3.4 & 3.8) */}
              <div className="card" style={{ border: '1px solid var(--border-highlight)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sliders size={18} color="var(--brand-primary)" />
                      Interactive Scoring & Control Engine
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Adjust likelihood, impact, or control strength below to test sensitivity and observe real-time score calculation.
                    </p>
                  </div>
                  <span className="badge badge-purple">Formula: {config.scoringFormula}</span>
                </div>

                {/* Score Comparison Display Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                  {/* Inherent Score Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Inherent Risk (L × I)
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: getRiskLevel(liveInherent.score).color, marginTop: 4 }}>
                      {liveInherent.score}
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}> / 25</span>
                    </div>
                    <span className={`badge ${getRiskLevel(liveInherent.score).class}`} style={{ marginTop: 4 }}>
                      {liveInherent.level}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Likelihood: {likelihood}/5 × Impact: {impact}/5
                    </div>
                  </div>

                  {/* Control Effectiveness Card */}
                  <div
                    style={{
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Control Effectiveness
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--brand-primary)', marginTop: 4 }}>
                      {effectiveness}%
                    </div>
                    <span className="badge badge-info" style={{ marginTop: 4 }}>
                      {effectiveness >= 80 ? 'Highly Effective' : effectiveness >= 50 ? 'Effective' : effectiveness >= 25 ? 'Partially Effective' : 'Deficient'}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Score Reduction: -{liveInherent.score - liveResidual.score} pts
                    </div>
                  </div>

                  {/* Residual Risk Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Residual Risk Score
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: getRiskLevel(liveResidual.score).color, marginTop: 4 }}>
                      {liveResidual.score}
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}> / 25</span>
                    </div>
                    <span className={`badge ${getRiskLevel(liveResidual.score).class}`} style={{ marginTop: 4 }}>
                      {liveResidual.level}
                    </span>
                    <div style={{ fontSize: 11.5, marginTop: 6, fontWeight: 600, color: liveTolerance.breached ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
                      {liveTolerance.status}
                    </div>
                  </div>
                </div>

                {/* Sliders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Likelihood Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label className="form-label">
                        Likelihood Scale: <strong style={{ color: 'var(--text-primary)' }}>{likelihood} - {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][likelihood - 1]}</strong>
                      </label>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1 (Rare) to 5 (Almost Certain)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={likelihood}
                      onChange={e => setLikelihood(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Impact Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label className="form-label">
                        Impact Scale: <strong style={{ color: 'var(--text-primary)' }}>{impact} - {['Insignificant (< 250K)', 'Minor (250K-1M)', 'Moderate (1M-5M)', 'Major (5M-20M)', 'Catastrophic (> 20M)'][impact - 1]}</strong>
                      </label>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1 (Insignificant) to 5 (Catastrophic)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={impact}
                      onChange={e => setImpact(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--risk-high)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Control Effectiveness Slider */}
                  <div style={{ background: '#f0f9ff', padding: 14, borderRadius: 8, border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label className="form-label" style={{ color: 'var(--brand-primary)' }}>
                        Control Effectiveness: <strong style={{ color: 'var(--text-primary)' }}>{effectiveness}%</strong>
                      </label>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Tender Demo: Shift from 60% down to 20% to see residual risk rise!
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={effectiveness}
                      onChange={e => setEffectiveness(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Save scoring button */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    setLikelihood(risk.inherentLikelihood);
                    setImpact(risk.inherentImpact);
                    setEffectiveness(risk.controlEffectiveness);
                  }}>
                    Reset Sliders
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveScoring}>
                    <CheckCircle size={15} />
                    <span>Save Calculated Assessment</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-ai" onClick={handleAiSuggestControls}>
                  <Sparkles size={16} />
                  <span>AI Suggest Controls</span>
                </button>
                <button className="btn btn-outline" onClick={handleEscalate}>
                  <AlertTriangle size={15} color="var(--risk-high)" />
                  <span>Escalate to Board Committee</span>
                </button>
                <button className="btn btn-secondary" onClick={handleApprove}>
                  <CheckCircle size={15} color="var(--risk-low)" />
                  <span>Approve Assessment</span>
                </button>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Printer size={15} />
                  <span>Print Risk Report</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Linked Risk Controls ({linkedControlsList.length})
                </h4>
                <button className="btn btn-secondary btn-sm" onClick={handleAiSuggestControls}>
                  <Sparkles size={14} color="var(--brand-primary)" />
                  <span>Recommend Controls</span>
                </button>
              </div>

              {linkedControlsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {linkedControlsList.map(c => (
                    <div key={c.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{c.code}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</span>
                          </div>
                          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {c.description}
                          </p>
                          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11.5, color: 'var(--text-muted)' }}>
                            <span>Type: <strong>{c.type}</strong></span>
                            <span>Frequency: <strong>{c.frequency}</strong></span>
                            <span>Owner: <strong>{c.owner}</strong></span>
                            <span>Last Test: <strong>{formatDate(c.lastTested)}</strong></span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${c.testResult === 'Pass' ? 'badge-low' : 'badge-high'}`}>
                            {c.testResult}
                          </span>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                            Score: {c.effectivenessScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No controls linked yet. Link existing controls from the centralized library or click "AI Suggest Controls".
                </div>
              )}
            </div>
          )}

          {/* Mitigations Tab */}
          {activeTab === 'mitigations' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Mitigation Action Plans ({linkedMitigationsList.length})
                </h4>
              </div>

              {linkedMitigationsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {linkedMitigationsList.map(m => (
                    <div key={m.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{m.code}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</span>
                          </div>
                          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {m.description}
                          </p>
                          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11.5, color: 'var(--text-muted)' }}>
                            <span>Owner: <strong>{m.owner}</strong></span>
                            <span>Deadline: <strong>{formatDate(m.deadline)}</strong></span>
                            <span>Priority: <strong>{m.priority}</strong></span>
                          </div>
                        </div>
                        <span className={`badge ${m.status === 'Completed' ? 'badge-low' : 'badge-high'}`}>
                          {m.status}
                        </span>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Progress Completion</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.progress}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${m.progress}%`,
                              background: m.progress >= 80 ? 'var(--risk-low)' : m.progress >= 40 ? 'var(--brand-primary)' : 'var(--risk-medium)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No mitigation plans currently active for this risk.
                </div>
              )}
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                Historical Loss Incidents Linked to this Risk ({linkedIncidentsList.length})
              </h4>
              {linkedIncidentsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {linkedIncidentsList.map(inc => (
                    <div key={inc.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: 'var(--risk-critical)', fontWeight: 700 }}>{inc.code}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                            Financial Loss: <strong style={{ color: 'var(--risk-critical)' }}>{formatZMW(inc.financialLossZMW)}</strong> • Recovered: {formatZMW(inc.recoveredAmountZMW)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                            <strong>Root Cause:</strong> {inc.rootCause}
                          </div>
                        </div>
                        <span className="badge badge-critical">{inc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No loss incidents recorded for this risk yet.
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                Assessment Scoring Audit Trail
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(risk.history || []).map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                        Assessment updated by {h.user || 'Risk Team'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Date: {formatDate(h.date)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className="badge badge-muted">Inherent: {h.inherent}/25</span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span className="badge badge-info">Control: {h.eff}%</span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span className="badge badge-low">Residual: {h.residual}/25</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
