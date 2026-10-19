import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  AlertOctagon,
  PlusCircle,
  Search,
  CheckCircle,
  HelpCircle,
  FileText,
  UserCheck,
  Calendar,
  Building2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { formatZMW, formatDate } from '../../utils/formatters';

export function IncidentManager() {
  const { incidents, addIncident, risks, branches, showToast } = useERM();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // New incident form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Operational / Claims Fraud');
  const [severity, setSeverity] = useState('High');
  const [branchId, setBranchId] = useState('BR-LUS');
  const [financialLossZMW, setFinancialLossZMW] = useState(280000);
  const [linkedRiskId, setLinkedRiskId] = useState(risks[0]?.id || '');
  const [rootCause, setRootCause] = useState('Lack of dual physical inspection on motor claims exceeding ZMW 50K');
  const [assignedTo, setAssignedTo] = useState('Brian Chilufya (Internal Audit)');

  const handleReportIncident = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bObj = branches.find(b => b.id === branchId);

    addIncident({
      title,
      category,
      severity,
      branchId,
      branchName: bObj ? bObj.name : 'Lusaka Main Branch',
      reportedBy: 'Kondwani Zulu (Claims Underwriter)',
      assignedTo,
      occurredDate: new Date().toISOString().slice(0, 10),
      financialLossZMW: Number(financialLossZMW) || 0,
      linkedRiskId,
      rootCause,
      fiveWhys: [
        'Why did it occur? Vehicle repair estimate was passed without cross-checking dealer pricing.',
        'Why was it not cross-checked? Manual adjuster was processing high backlog of claims.',
        'Why was there a backlog? System integration with supplier portal was offline.',
        'Why was portal offline? Scheduled maintenance coincided with month-end renewals.',
        'Root Cause: Inadequate maintenance window scheduling and absence of fallback pricing validation.'
      ],
      correctiveAction: 'Deploy digital part price catalogue check and enforce mandatory dual-approval for invoices > ZMW 50,000.',
      actionDeadline: '2026-11-30'
    });

    setReportModalOpen(false);
    setTitle('');
  };

  const handleCloseIncident = (id) => {
    showToast('Incident Closed', `Incident ${id} root cause remediated and approved for closure by Management.`, 'success');
    setSelectedIncident(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Risk Incident Management & Root Cause Analysis (Section 7)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Record loss events, investigate contributing factors via 5-Why analysis, assign corrective actions, and track recovery.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setReportModalOpen(true)}>
          <PlusCircle size={15} />
          <span>Report Risk Incident</span>
        </button>
      </div>

      {/* Incidents Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertOctagon size={18} color="#dc2626" />
            <span>Operational & Loss Incident Register ({incidents.length})</span>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident Code & Title</th>
                <th>Category</th>
                <th>Branch</th>
                <th>Severity</th>
                <th>Occurred Date</th>
                <th>Gross Loss</th>
                <th>Recovered</th>
                <th>Assigned Investigator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id}>
                  <td style={{ minWidth: 260 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ color: '#dc2626', marginRight: 6 }}>{inc.code}</span>
                      {inc.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Reported by {inc.reportedBy}
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{inc.category}</span></td>
                  <td>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {inc.branchName.replace(' Head Office & Main Branch', ' (HQ)').replace(' Branch', '')}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${inc.severity === 'Critical' ? 'badge-critical' : inc.severity === 'High' ? 'badge-high' : 'badge-medium'}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td>{formatDate(inc.occurredDate)}</td>
                  <td><strong style={{ color: '#dc2626' }}>{formatZMW(inc.financialLossZMW)}</strong></td>
                  <td><strong style={{ color: '#16a34a' }}>{formatZMW(inc.recoveredAmountZMW)}</strong></td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {inc.assignedTo}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${inc.status === 'Closed' ? 'badge-low' : 'badge-info'}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedIncident(inc)}
                    >
                      <span>RCA & Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail & 5-Whys Modal */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                  {selectedIncident.code} • INVESTIGATION REPORT
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {selectedIncident.title}
                </h3>
              </div>
              <span className={`badge ${selectedIncident.status === 'Closed' ? 'badge-low' : 'badge-critical'}`}>
                {selectedIncident.status}
              </span>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Financial metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gross Financial Loss</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                    {formatZMW(selectedIncident.financialLossZMW)}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recovered Amount</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                    {formatZMW(selectedIncident.recoveredAmountZMW)}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Net Enterprise Loss</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                    {formatZMW(selectedIncident.financialLossZMW - selectedIncident.recoveredAmountZMW)}
                  </div>
                </div>
              </div>

              {/* 5-Whys Root Cause Analysis (Task 7.4) */}
              <div className="card" style={{ border: '1px solid var(--border-medium)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HelpCircle size={15} />
                  <span>5-Whys Root Cause Analysis (Task 7.4)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedIncident.fiveWhys || []).map((why, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        background: 'var(--bg-subtle)',
                        borderRadius: 6,
                        borderLeft: '3px solid var(--brand-primary)',
                        fontSize: 12,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {why}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, padding: 10, background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }}>
                  <strong style={{ color: '#991b1b', fontSize: 11.5 }}>Identified Root Cause: </strong>
                  <span style={{ fontSize: 12, color: '#7f1d1d' }}>{selectedIncident.rootCause}</span>
                </div>
              </div>

              {/* Corrective Action (Task 7.5) */}
              <div className="card">
                <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>
                  Corrective Measures & Remediations (Task 7.5)
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {selectedIncident.correctiveAction}
                </p>
                <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  <span>Assigned Investigator: <strong style={{ color: 'var(--text-primary)' }}>{selectedIncident.assignedTo}</strong></span>
                  <span>Target Deadline: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(selectedIncident.actionDeadline)}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedIncident(null)}>
                  Close
                </button>
                {selectedIncident.status !== 'Closed' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleCloseIncident(selectedIncident.id)}
                  >
                    <CheckCircle size={15} />
                    <span>Approve Remediations & Close Incident</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report New Incident Modal */}
      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Report Risk Incident
            </div>

            <form onSubmit={handleReportIncident} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Incident Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Suspicious Motor Insurance Fleet Claim in Lusaka"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Operational / Claims Fraud">Operational / Claims Fraud</option>
                    <option value="Cyber / Technology Outage">Cyber / Technology Outage</option>
                    <option value="Financial / Broker Default">Financial / Broker Default</option>
                    <option value="Strategic / Mining Loss">Strategic / Mining Loss</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Branch Occurred</label>
                  <select className="form-select" value={branchId} onChange={e => setBranchId(e.target.value)}>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Financial Loss (ZMW)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={financialLossZMW}
                    onChange={e => setFinancialLossZMW(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Root Cause Observation</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Incident for Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
