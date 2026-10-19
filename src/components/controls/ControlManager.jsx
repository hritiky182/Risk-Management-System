import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  ShieldCheck,
  TrendingUp,
  PlusCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Filter,
  FileCheck,
  Calendar,
  User
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export function ControlManager() {
  const {
    controls,
    addControl,
    mitigations,
    addMitigation,
    updateMitigation,
    risks,
    showToast
  } = useERM();

  const [activeTab, setActiveTab] = useState('mitigations'); // 'mitigations' | 'controls'
  const [newMitigationModal, setNewMitigationModal] = useState(false);
  const [newControlModal, setNewControlModal] = useState(false);

  // New Mitigation Form State
  const [mitTitle, setMitTitle] = useState('');
  const [mitDesc, setMitDesc] = useState('');
  const [mitRiskId, setMitRiskId] = useState(risks[0]?.id || '');
  const [mitOwner, setMitOwner] = useState('Claims Manager');
  const [mitDeadline, setMitDeadline] = useState('2026-12-01');
  const [mitPriority, setMitPriority] = useState('High');

  // New Control Form State
  const [ctlTitle, setCtlTitle] = useState('');
  const [ctlDesc, setCtlDesc] = useState('');
  const [ctlType, setCtlType] = useState('Preventive');
  const [ctlCategory, setCtlCategory] = useState('Operational');
  const [ctlFrequency, setCtlFrequency] = useState('Continuous');
  const [ctlOwner, setCtlOwner] = useState('Operations Lead');
  const [ctlScore, setCtlScore] = useState(75);

  const handleCreateMitigation = (e) => {
    e.preventDefault();
    if (!mitTitle.trim()) return;

    addMitigation({
      title: mitTitle,
      description: mitDesc,
      riskId: mitRiskId,
      owner: mitOwner,
      deadline: mitDeadline,
      priority: mitPriority
    });

    setNewMitigationModal(false);
    setMitTitle('');
    setMitDesc('');
  };

  const handleCreateControl = (e) => {
    e.preventDefault();
    if (!ctlTitle.trim()) return;

    addControl({
      title: ctlTitle,
      description: ctlDesc,
      type: ctlType,
      category: ctlCategory,
      frequency: ctlFrequency,
      owner: ctlOwner,
      designEffectiveness: 'Effective',
      operationalEffectiveness: 'Effective',
      effectivenessScore: Number(ctlScore) || 75
    });

    setNewControlModal(false);
    setCtlTitle('');
    setCtlDesc('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Risk Controls & Mitigation Management (Section 4)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage preventive/detective controls, testing frequencies, and tracking of corrective action plans.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setNewControlModal(true)}>
            <PlusCircle size={15} />
            <span>Add New Control</span>
          </button>
          <button className="btn btn-primary" onClick={() => setNewMitigationModal(true)}>
            <PlusCircle size={15} />
            <span>Create Mitigation Plan</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'mitigations' ? 'active' : ''}`}
          onClick={() => setActiveTab('mitigations')}
        >
          <TrendingUp size={16} />
          <span>Mitigation Action Plans ({mitigations.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          <ShieldCheck size={16} />
          <span>Centralized Control Library ({controls.length})</span>
        </button>
      </div>

      {/* TAB 1: MITIGATION PLANS */}
      {activeTab === 'mitigations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Code & Title</th>
                  <th>Target Risk</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mitigations.map(plan => {
                  const targetRisk = risks.find(r => r.id === plan.riskId || r.code === plan.riskId);

                  return (
                    <tr key={plan.id}>
                      <td style={{ minWidth: 260 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <span style={{ color: '#d97706', marginRight: 6 }}>{plan.code}</span>
                          {plan.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {plan.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {targetRisk ? `${targetRisk.code} - ${targetRisk.title.slice(0, 20)}...` : plan.riskId}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {plan.owner}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{formatDate(plan.deadline)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${plan.priority === 'Critical' ? 'badge-critical' : plan.priority === 'High' ? 'badge-high' : 'badge-medium'}`}>
                          {plan.priority}
                        </span>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar-bg" style={{ flex: 1 }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${plan.progress}%`,
                                background: plan.progress === 100 ? '#10b981' : plan.progress > 50 ? 'var(--brand-primary)' : '#d97706'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', width: 34 }}>
                            {plan.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${plan.status === 'Completed' ? 'badge-low' : plan.status === 'In Progress' ? 'badge-info' : 'badge-medium'}`}>
                          {plan.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {plan.status !== 'Completed' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const newProg = Math.min(100, plan.progress + 25);
                                updateMitigation(plan.id, {
                                   progress: newProg,
                                   status: newProg === 100 ? 'Completed' : 'In Progress'
                                });
                              }}
                            >
                              +25% Progress
                            </button>
                          )}
                          {plan.status !== 'Completed' && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => updateMitigation(plan.id, { progress: 100, status: 'Completed' })}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTROLS LIBRARY */}
      {activeTab === 'controls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Control Code & Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Owner</th>
                  <th>Design Eff.</th>
                  <th>Score</th>
                  <th>Last Tested</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {controls.map(c => (
                  <tr key={c.id}>
                    <td style={{ minWidth: 260 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--brand-primary)', marginRight: 6 }}>{c.code}</span>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {c.description}
                      </div>
                    </td>
                    <td><span className="badge badge-muted">{c.category}</span></td>
                    <td>
                      <span className="badge badge-purple">{c.type}</span>
                    </td>
                    <td>{c.frequency}</td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {c.owner}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-low">{c.designEffectiveness}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--brand-primary)' }}>{c.effectivenessScore}%</strong>
                    </td>
                    <td>{formatDate(c.lastTested)}</td>
                    <td>
                      <span className={`badge ${c.testResult === 'Pass' ? 'badge-low' : 'badge-high'}`}>
                        {c.testResult}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => showToast('Control Test Recorded', `Operational test for ${c.code} passed audit criteria.`, 'success')}
                      >
                        Record Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Mitigation */}
      {newMitigationModal && (
        <div className="modal-overlay" onClick={() => setNewMitigationModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Create Risk Mitigation Action Plan
            </div>

            <form onSubmit={handleCreateMitigation} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Action Plan Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={mitTitle}
                  onChange={e => setMitTitle(e.target.value)}
                  placeholder="e.g. Implement Automated Claims Duplicate Invoice Checker"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Identified Risk</label>
                <select className="form-select" value={mitRiskId} onChange={e => setMitRiskId(e.target.value)}>
                  {risks.map(r => (
                    <option key={r.id} value={r.id}>{r.code} - {r.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Action Description & Milestone</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={mitDesc}
                  onChange={e => setMitDesc(e.target.value)}
                  placeholder="Detail step-by-step mitigation actions..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Assigned Owner</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mitOwner}
                    onChange={e => setMitOwner(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={mitDeadline}
                    onChange={e => setMitDeadline(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={mitPriority} onChange={e => setMitPriority(e.target.value)}>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewMitigationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Action Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Control */}
      {newControlModal && (
        <div className="modal-overlay" onClick={() => setNewControlModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Add Control to Central Repository
            </div>

            <form onSubmit={handleCreateControl} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Control Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={ctlTitle}
                  onChange={e => setCtlTitle(e.target.value)}
                  placeholder="e.g. Independent Loss Adjuster Physical Inspection"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Control Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={ctlDesc}
                  onChange={e => setCtlDesc(e.target.value)}
                  placeholder="Operating procedure and verification criteria..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Control Type</label>
                  <select className="form-select" value={ctlType} onChange={e => setCtlType(e.target.value)}>
                    <option value="Preventive">Preventive</option>
                    <option value="Detective">Detective</option>
                    <option value="Corrective">Corrective</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={ctlFrequency} onChange={e => setCtlFrequency(e.target.value)}>
                    <option value="Continuous">Continuous</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Effectiveness Rating (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="form-input"
                    value={ctlScore}
                    onChange={e => setCtlScore(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewControlModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
