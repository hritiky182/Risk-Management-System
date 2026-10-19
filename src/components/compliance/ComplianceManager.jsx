import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  PlusCircle,
  Building,
  ExternalLink,
  Shield
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export function ComplianceManager() {
  const { compliance, setCompliance, showToast, addAuditLog } = useERM();

  const [evidenceModalItem, setEvidenceModalItem] = useState(null);
  const [uploadedEvidenceName, setUploadedEvidenceName] = useState('');

  const handleUpdateStatus = (id, newStatus) => {
    setCompliance(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
    addAuditLog('COMPLIANCE_STATUS_UPDATE', 'Compliance Obligation', id, `Updated status to: ${newStatus}`);
    showToast('Compliance Status Updated', `${id} marked as ${newStatus}`, 'success');
  };

  const handleAddEvidence = (e) => {
    e.preventDefault();
    if (!uploadedEvidenceName.trim() || !evidenceModalItem) return;

    setCompliance(prev =>
      prev.map(c =>
        c.id === evidenceModalItem.id
          ? {
              ...c,
              evidenceDocs: [...(c.evidenceDocs || []), uploadedEvidenceName],
              complianceRate: Math.min(100, (c.complianceRate || 80) + 5)
            }
          : c
      )
    );

    showToast('Evidence Uploaded', `Document "${uploadedEvidenceName}" linked to ${evidenceModalItem.code}.`, 'success');
    setEvidenceModalItem(null);
    setUploadedEvidenceName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Compliance & Regulatory Governance (Section 6)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Track statutory obligations under Pensions & Insurance Authority (PIA), FIC AML/CFT, and Data Protection frameworks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-purple" style={{ padding: '6px 12px', fontSize: 12 }}>
            PIA Act 2021 Compliant
          </span>
          <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: 12 }}>
            FIC AML/CFT Directive
          </span>
        </div>
      </div>

      {/* Frameworks Bar */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
          Configured Regulatory & Industry Standards Frameworks (Task 6.2)
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>PIA Risk-Based Supervision</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pensions & Insurance Authority of Zambia</div>
            <div style={{ marginTop: 6 }}><span className="badge badge-low">100% Active</span></div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>FIC Anti-Money Laundering</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Financial Intelligence Centre AML/CFT Act</div>
            <div style={{ marginTop: 6 }}><span className="badge badge-medium">84% Screening</span></div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>Data Protection Act No. 3</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Policyholder Personal Data Privacy</div>
            <div style={{ marginTop: 6 }}><span className="badge badge-low">92% Audited</span></div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>ISO 31000:2018 ERM</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>International Enterprise Risk Standard</div>
            <div style={{ marginTop: 6 }}><span className="badge badge-low">Aligned</span></div>
          </div>
        </div>
      </div>

      {/* Compliance Register Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileCheck2 size={18} color="#16a34a" />
            <span>Statutory Compliance Obligations ({compliance.length})</span>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Obligation Code & Title</th>
                <th>Statutory Framework</th>
                <th>Supervisory Authority</th>
                <th>Filing Deadline</th>
                <th>Assigned Officer</th>
                <th>Score</th>
                <th>Evidence Docs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map(c => (
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
                  <td><span className="badge badge-muted">{c.framework}</span></td>
                  <td>{c.authority}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      <span>{formatDate(c.deadline)}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {c.assignedTo}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a' }}>{c.complianceRate}%</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {(c.evidenceDocs || []).map((doc, idx) => (
                        <span key={idx} style={{ fontSize: 11, color: 'var(--brand-primary)' }}>
                          📄 {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'Compliant' ? 'badge-low' : 'badge-medium'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEvidenceModalItem(c)}
                        title="Upload Audit Evidence"
                      >
                        <Upload size={12} />
                        <span>Evidence</span>
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleUpdateStatus(c.id, c.status === 'Compliant' ? 'Partially Compliant' : 'Compliant')}
                      >
                        Toggle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {evidenceModalItem && (
        <div className="modal-overlay" onClick={() => setEvidenceModalItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              Upload Compliance Verification Evidence
            </div>

            <form onSubmit={handleAddEvidence} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target Obligation:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                  {evidenceModalItem.code} - {evidenceModalItem.title}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Document Title / File Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={uploadedEvidenceName}
                  onChange={e => setUploadedEvidenceName(e.target.value)}
                  placeholder="e.g. PIA_Quarterly_Solvency_Audit_Signoff.pdf"
                />
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 8,
                  border: '2px dashed var(--border-medium)',
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => setUploadedEvidenceName('PIA_Solvency_Certificate_Signed_' + Date.now().toString().slice(-4) + '.pdf')}
              >
                <Upload size={24} color="var(--brand-primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Click to simulate certificate upload</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Supported formats: PDF, DOCX, XLSX, JPG</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEvidenceModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Attach Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
