import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import { ScrollText, Search, Download, ShieldCheck, Filter } from 'lucide-react';
import { exportToCSV, formatDateTime } from '../../utils/formatters';

export function AuditLogViewer() {
  const { auditLogs } = useERM();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const q = search.toLowerCase();
    return (
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.summary.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  const handleExportLogs = () => {
    exportToCSV(`Apex_ERMS_Audit_Trail_${new Date().toISOString().slice(0, 10)}`, filteredLogs);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Enterprise Security & Audit Trails (Section 11.5)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Immutable activity log recording user authentication, risk scoring revisions, workflow approvals, and system events.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleExportLogs}>
          <Download size={15} />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit trail by actor, action type, risk code, or summary..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>Actor & Role</th>
              <th>Action Type</th>
              <th>Target Entity</th>
              <th>Entity ID</th>
              <th>Activity Summary</th>
              <th>IP Origin</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-primary)' }}>
                    {log.id}
                  </span>
                </td>
                <td style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.actorName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.actorRole}</div>
                </td>
                <td>
                  <span className="badge badge-purple">{log.action}</span>
                </td>
                <td>{log.entityType}</td>
                <td>
                  <strong style={{ color: 'var(--brand-primary)' }}>{log.entityId}</strong>
                </td>
                <td>
                  <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{log.summary}</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                    {log.ipAddress}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
