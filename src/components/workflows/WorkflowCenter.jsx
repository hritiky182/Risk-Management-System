import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Send,
  AlertTriangle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export function WorkflowCenter() {
  const {
    risks,
    mitigations,
    rcsaSubmissions,
    showToast,
    addAuditLog,
    currentUser,
    setSelectedRiskForDrawer
  } = useERM();

  const [activeWorkflowTab, setActiveWorkflowTab] = useState('inbox'); // 'inbox' | 'rules' | 'history'

  // Construct pending task queue
  const pendingApprovals = [
    {
      id: 'TSK-001',
      title: 'Review Critical Assessment: Insurance Claim Fraud',
      type: 'Risk Escalation Review',
      entityCode: 'RSK-OPS-001',
      submittedBy: 'Sipho Phiri (Lusaka Branch)',
      dueDate: '2026-10-22',
      priority: 'Critical',
      severityScore: '20/25 Inherent',
      entity: risks.find(r => r.code === 'RSK-OPS-001')
    },
    {
      id: 'TSK-002',
      title: 'Q3 Branch RCSA Self-Assessment Signoff: Ndola Commercial',
      type: 'RCSA Approval',
      entityCode: 'RCSA-2026-NDO',
      submittedBy: 'Grace Lungu (Ndola Branch Manager)',
      dueDate: '2026-10-24',
      priority: 'High',
      severityScore: '2 High Risks',
      entity: null
    },
    {
      id: 'TSK-003',
      title: 'Mitigation Plan Verification: AI Motor Parts OCR Tool',
      type: 'Mitigation Milestone',
      entityCode: 'MIT-001',
      submittedBy: 'Kondwani Zulu (Claims Underwriter)',
      dueDate: '2026-10-25',
      priority: 'High',
      severityScore: '70% Complete',
      entity: null
    }
  ];

  const handleAction = (taskId, actionType) => {
    addAuditLog('WORKFLOW_ACTION', 'Task', taskId, `User performed action: ${actionType}`);
    showToast('Task Updated', `Task ${taskId} marked as ${actionType}.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Workflow Automation & Task Approval Inbox (Section 10)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Manage task assignments, sign-off reviews, multi-level approvals, and automated escalation triggers.
          </p>
        </div>

        <span className="badge badge-info" style={{ padding: '6px 12px', fontSize: 12 }}>
          {pendingApprovals.length} Pending Tasks for {currentUser.name}
        </span>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeWorkflowTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveWorkflowTab('inbox')}
        >
          <CheckSquare size={16} />
          <span>My Assigned Tasks & Approvals ({pendingApprovals.length})</span>
        </button>
        <button
          className={`tab-btn ${activeWorkflowTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveWorkflowTab('rules')}
        >
          <Sliders size={16} />
          <span>Automated Escalation Rules</span>
        </button>
      </div>

      {/* TAB 1: INBOX */}
      {activeWorkflowTab === 'inbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingApprovals.map(task => (
            <div
              key={task.id}
              className="card"
              style={{
                borderLeft: `4px solid ${task.priority === 'Critical' ? '#dc2626' : '#ea580c'}`,
                padding: 18
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)' }}>
                      {task.id} • {task.type}
                    </span>
                    <span className={`badge ${task.priority === 'Critical' ? 'badge-critical' : 'badge-high'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {task.title}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Submitted by: <strong>{task.submittedBy}</strong> • Target Code: <strong style={{ color: 'var(--brand-primary)' }}>{task.entityCode}</strong> • Due: {formatDate(task.dueDate)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {task.entity && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedRiskForDrawer(task.entity)}
                    >
                      Inspect Risk Record
                    </button>
                  )}
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(task.id, 'APPROVED')}
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleAction(task.id, 'RETURNED FOR CORRECTION')}
                  >
                    <RotateCcw size={14} />
                    <span>Return</span>
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleAction(task.id, 'REJECTED')}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RULES */}
      {activeWorkflowTab === 'rules' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} color="var(--brand-primary)" />
              <span>Configured Automated Workflow & Escalation Triggers</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>RULE-ESC-01: Critical Score Auto-Escalation</span>
                <span className="badge badge-low">Active</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                IF Inherent Risk Score &ge; 16 OR Residual Risk Score &gt; 9, THEN automatically assign executive review task to Risk Manager and dispatch alert to Board Risk Committee.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>RULE-REM-02: Mitigation Deadline Warning</span>
                <span className="badge badge-low">Active</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Generate reminder notification 7 days prior to mitigation action plan deadline, and flag as "Overdue Alert" if progress &lt; 100% past due date.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 8, border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>RULE-RCSA-03: Monthly Branch RCSA Consolidation</span>
                <span className="badge badge-low">Active</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Upon Risk Manager approval of regional branch RCSA, automatically roll up branch risk ratings into the corporate risk register without manual re-entry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
