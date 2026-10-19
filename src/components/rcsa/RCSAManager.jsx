import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  Eye,
  Send,
  CheckCircle2,
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export function RCSAManager() {
  const { rcsaSubmissions, approveRCSA, branches, showToast, currentUser } = useERM();

  const [reviewModalData, setReviewModalData] = useState(null);
  const [newRCSAModal, setNewRCSAModal] = useState(false);

  // Self-assessment questionnaire state
  const [selectedBranch, setSelectedBranch] = useState('BR-KIT');
  const [qClaims, setQClaims] = useState('3');
  const [qUnderwriting, setQUnderwriting] = useState('4');
  const [qIT, setQIT] = useState('4');
  const [qCash, setQCash] = useState('2');
  const [branchComment, setBranchComment] = useState('Mining machinery inspection backlogs noted.');

  const handleOpenReview = (submission) => {
    setReviewModalData(submission);
  };

  const handleApproveSubmission = (id) => {
    approveRCSA(id);
    setReviewModalData(null);
  };

  const handleReturnSubmission = (id) => {
    showToast('RCSA Returned for Correction', `Returned assessment ${id} to branch manager with review notes.`, 'warning');
    setReviewModalData(null);
  };

  const handleSubmitNewRCSA = (e) => {
    e.preventDefault();
    showToast('RCSA Submitted', `Q3 Self-Assessment for ${branches.find(b => b.id === selectedBranch)?.name} submitted to Risk Manager.`, 'success');
    setNewRCSAModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Branch RCSA (Risk & Control Self-Assessment) Management (Section 5)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Branch-level operational self-assessment, submission tracking, review workflows, and corporate consolidation.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setNewRCSAModal(true)}>
          <Send size={15} />
          <span>Complete Branch Self-Assessment</span>
        </button>
      </div>

      {/* Tender Example Demo Callout Box */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sparkles size={16} color="var(--brand-primary)" />
          <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: 13 }}>
            Tender Demonstration Scope (Section 5 Demonstration Example)
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: '#1e3a5f', lineHeight: 1.5 }}>
          Demonstrates how regional branches (Lusaka, Ndola, Kitwe, Livingstone, Chipata) submit monthly self-assessments.
          The corporate risk manager reviews high risks, validates control effectiveness ratings, and consolidates approved findings into the centralized Corporate Risk Register.
        </p>
      </div>

      {/* RCSA Submissions Tracking Table (Direct tender match) */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Building2 size={18} color="var(--brand-primary)" />
            <span>Branch Assessment Submission Status (Q3 2026 Cycle)</span>
          </div>
          <span className="badge badge-purple">5 Branch Business Units</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch Name & Code</th>
                <th>Assessment Period</th>
                <th>Submission Status</th>
                <th>High & Critical Risks</th>
                <th>Avg Control Strength</th>
                <th>Submitted By</th>
                <th>Reviewed By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rcsaSubmissions.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.branchName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Assessed: {item.totalRisksAssessed} total processes
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{item.period}</span></td>
                  <td>
                    <span className={`badge ${item.status === 'Approved' ? 'badge-low' : item.status === 'Submitted' ? 'badge-info' : 'badge-high'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-high">{item.highRisksCount} High</span>
                      {item.criticalRisksCount > 0 && (
                        <span className="badge badge-critical">{item.criticalRisksCount} Crit</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: item.averageControlEffectiveness >= 70 ? '#34d399' : '#f59e0b' }}>
                      {item.averageControlEffectiveness}%
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {item.submittedBy || 'Not submitted yet'}
                    </span>
                    {item.submissionDate && (
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{formatDate(item.submissionDate)}</div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {item.reviewedBy || 'Pending Risk Manager Review'}
                    </span>
                    {item.reviewDate && (
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{formatDate(item.reviewDate)}</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenReview(item)}
                    >
                      <Eye size={13} />
                      <span>Review Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalData && (
        <div className="modal-overlay" onClick={() => setReviewModalData(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)' }}>
                  RCSA SUBMISSION REVIEW • {reviewModalData.period}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {reviewModalData.branchName}
                </h3>
              </div>
              <span className={`badge ${reviewModalData.status === 'Approved' ? 'badge-low' : 'badge-info'}`}>
                {reviewModalData.status}
              </span>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Branch Operational Comments
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 6 }}>
                  {reviewModalData.comments || 'No specific branch comments recorded.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processes Assessed</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                    {reviewModalData.totalRisksAssessed}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>High / Critical Risks</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                    {reviewModalData.highRisksCount + reviewModalData.criticalRisksCount}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Control Strength</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 4 }}>
                    {reviewModalData.averageControlEffectiveness}%
                  </div>
                </div>
              </div>

              {/* Approval Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReviewModalData(null)}
                >
                  Close
                </button>
                {reviewModalData.status !== 'Approved' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleReturnSubmission(reviewModalData.id)}
                      style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <RotateCcw size={14} />
                      <span>Return for Correction</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleApproveSubmission(reviewModalData.id)}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve & Consolidate into Register</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New RCSA Self-Assessment Form Modal */}
      {newRCSAModal && (
        <div className="modal-overlay" onClick={() => setNewRCSAModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Complete Branch Risk & Control Self-Assessment (RCSA)
            </div>

            <form onSubmit={handleSubmitNewRCSA} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Branch</label>
                <select className="form-select" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Assessment Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>1. Motor & Commercial Claims Settlement Verification</span>
                    <span className="badge badge-info">{qClaims}/5 Likelihood</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qClaims}
                    onChange={e => setQClaims(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                  />
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>2. Policy Underwriting Guidelines Adherence</span>
                    <span className="badge badge-info">{qUnderwriting}/5 Likelihood</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qUnderwriting}
                    onChange={e => setQUnderwriting(e.target.value)}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>3. IT Infrastructure & Branch Terminal Continuity</span>
                    <span className="badge badge-info">{qIT}/5 Likelihood</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qIT}
                    onChange={e => setQIT(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                  />
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>4. Cash Register Sweeps & Bank Deposit Reconciliation</span>
                    <span className="badge badge-info">{qCash}/5 Likelihood</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qCash}
                    onChange={e => setQCash(e.target.value)}
                    style={{ width: '100%', accentColor: '#d97706' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Branch Manager Attestation & Remarks</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={branchComment}
                  onChange={e => setBranchComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewRCSAModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  <span>Submit RCSA to Risk Manager</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
