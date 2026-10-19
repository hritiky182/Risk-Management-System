import React from 'react';
import { useERM } from '../../context/ERMContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  FileCheck2,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  Download,
  Sparkles,
  ArrowRight,
  Building2,
  PieChart,
  Activity
} from 'lucide-react';
import { formatZMW, formatDate, exportToCSV } from '../../utils/formatters';
import { RiskHeatmap } from './RiskHeatmap';

export function ExecutiveDashboard() {
  const {
    filteredRisks,
    risks,
    controls,
    mitigations,
    incidents,
    compliance,
    rcsaSubmissions,
    kris,
    setActiveTab,
    setSelectedRiskForDrawer,
    runAIUniverseScan
  } = useERM();

  // Dynamic calculations from database
  const totalRisks = filteredRisks.length;
  const criticalRisks = filteredRisks.filter(r => r.residualScore >= 16);
  const highRisks = filteredRisks.filter(r => r.residualScore >= 10 && r.residualScore < 16);
  const mediumRisks = filteredRisks.filter(r => r.residualScore >= 5 && r.residualScore < 10);
  const lowRisks = filteredRisks.filter(r => r.residualScore < 5);

  const openMitigations = mitigations.filter(m => m.status === 'Open' || m.status === 'In Progress');
  const overdueMitigations = mitigations.filter(m => m.status === 'Overdue' || new Date(m.deadline) < new Date('2026-10-19'));

  const compliantCount = compliance.filter(c => c.status === 'Compliant').length;
  const complianceRate = compliance.length ? Math.round((compliantCount / compliance.length) * 100) : 100;

  const openIncidents = incidents.filter(i => i.status !== 'Closed');
  const totalFinancialLoss = incidents.reduce((acc, i) => acc + (i.financialLossZMW || 0), 0);

  const approvedRcsas = rcsaSubmissions.filter(r => r.status === 'Approved').length;
  const rcsaCompletionRate = rcsaSubmissions.length ? Math.round((approvedRcsas / rcsaSubmissions.length) * 100) : 0;

  const totalCapitalExposure = filteredRisks.reduce((acc, r) => acc + (r.financialExposureZMW || 0), 0);

  // Group risks by category
  const categories = ['Operational', 'Financial', 'Compliance', 'Strategic', 'Cyber/Tech', 'Reputational'];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: filteredRisks.filter(r => r.category === cat).length
  }));

  // Handle Export
  const handleExportSummary = () => {
    const rows = filteredRisks.map(r => ({
      Code: r.code,
      Title: r.title,
      Category: r.category,
      Branch: r.branchName,
      InherentScore: r.inherentScore,
      InherentLevel: r.inherentLevel,
      ControlEffectiveness: `${r.controlEffectiveness}%`,
      ResidualScore: r.residualScore,
      ResidualLevel: r.residualLevel,
      FinancialExposureZMW: r.financialExposureZMW,
      ToleranceStatus: r.toleranceStatus,
      Owner: r.owner
    }));
    exportToCSV(`Apex_ERMS_Risk_Register_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner / Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Executive Enterprise Risk Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Apex General Insurance Limited • Governance, Risk & Solvency Performance
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('risk-identify')}>
            <PlusCircle size={15} />
            <span>Identify New Risk</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('incidents')}>
            <AlertOctagon size={15} color="var(--risk-critical)" />
            <span>Report Loss Incident</span>
          </button>
          <button className="btn btn-ai" onClick={runAIUniverseScan}>
            <Sparkles size={15} />
            <span>AI Risk Scan</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportSummary}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary 8 Metric Cards Grid (Tender Section 8 Requirement) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14
        }}
      >
        {/* Total Registered Risks */}
        <div className="metric-card" onClick={() => setActiveTab('risks')}>
          <div className="metric-top">
            <span className="metric-label">Total Registered Risks</span>
            <div className="metric-icon-box" style={{ background: '#e0f2fe', color: '#006ec7' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{totalRisks}</span>
            <span className="metric-trend" style={{ background: '#e0f2fe', color: '#006ec7' }}>
              Active
            </span>
          </div>
          <span className="metric-sub">{formatZMW(totalCapitalExposure, true)} Total Exposure</span>
        </div>

        {/* Critical Risks */}
        <div className="metric-card" onClick={() => setActiveTab('risks')}>
          <div className="metric-top">
            <span className="metric-label">Critical Risks (≥ 16)</span>
            <div className="metric-icon-box" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--risk-critical)' }}>{criticalRisks.length}</span>
            <span className="metric-trend" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
              High Priority
            </span>
          </div>
          <span className="metric-sub">Immediate mitigation mandate</span>
        </div>

        {/* High Risks */}
        <div className="metric-card" onClick={() => setActiveTab('risks')}>
          <div className="metric-top">
            <span className="metric-label">High Risks (10 - 15)</span>
            <div className="metric-icon-box" style={{ background: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--risk-high)' }}>{highRisks.length}</span>
            <span className="metric-trend" style={{ background: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
              Monitored
            </span>
          </div>
          <span className="metric-sub">Active control testing</span>
        </div>

        {/* Open Mitigation Tasks */}
        <div className="metric-card" onClick={() => setActiveTab('controls')}>
          <div className="metric-top">
            <span className="metric-label">Open Mitigation Tasks</span>
            <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{openMitigations.length}</span>
            <span className="metric-trend" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              {mitigations.length} Total
            </span>
          </div>
          <span className="metric-sub">Assigned to branch owners</span>
        </div>

        {/* Overdue Activities */}
        <div className="metric-card" onClick={() => setActiveTab('controls')}>
          <div className="metric-top">
            <span className="metric-label">Overdue Activities</span>
            <div className="metric-icon-box" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
              <AlertOctagon size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: overdueMitigations.length ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
              {overdueMitigations.length}
            </span>
            <span className="metric-trend" style={{ background: overdueMitigations.length ? 'var(--risk-critical-bg)' : 'var(--risk-low-bg)', color: overdueMitigations.length ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
              {overdueMitigations.length > 0 ? 'SLA Alert' : 'On Track'}
            </span>
          </div>
          <span className="metric-sub">Target resolution: &lt; 7 days</span>
        </div>

        {/* Compliance Rate */}
        <div className="metric-card" onClick={() => setActiveTab('compliance')}>
          <div className="metric-top">
            <span className="metric-label">Compliance Rate (%)</span>
            <div className="metric-icon-box" style={{ background: 'var(--risk-low-bg)', color: 'var(--risk-low)' }}>
              <FileCheck2 size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--risk-low)' }}>{complianceRate}%</span>
            <span className="metric-trend" style={{ background: 'var(--risk-low-bg)', color: 'var(--risk-low)' }}>
              PIA / FIC
            </span>
          </div>
          <span className="metric-sub">{compliance.length} Statutory obligations</span>
        </div>

        {/* Open Incidents */}
        <div className="metric-card" onClick={() => setActiveTab('incidents')}>
          <div className="metric-top">
            <span className="metric-label">Open Loss Incidents</span>
            <div className="metric-icon-box" style={{ background: 'var(--risk-medium-bg)', color: 'var(--risk-medium)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--risk-medium)' }}>{openIncidents.length}</span>
            <span className="metric-trend" style={{ background: 'var(--risk-medium-bg)', color: 'var(--risk-medium)' }}>
              Loss: {formatZMW(totalFinancialLoss, true)}
            </span>
          </div>
          <span className="metric-sub">RCA & Recovery active</span>
        </div>

        {/* RCSA Completion Rate */}
        <div className="metric-card" onClick={() => setActiveTab('rcsa')}>
          <div className="metric-top">
            <span className="metric-label">RCSA Completion Rate</span>
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: 'var(--brand-primary)' }}>
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ color: 'var(--brand-primary)' }}>{rcsaCompletionRate}%</span>
            <span className="metric-trend" style={{ background: '#f0f9ff', color: 'var(--brand-primary)' }}>
              Q3 2026
            </span>
          </div>
          <span className="metric-sub">{approvedRcsas} of 5 Branches approved</span>
        </div>
      </div>

      {/* Main Section: 5x5 Heatmap Matrix + Category & Branch Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* 5x5 Heatmap */}
        <RiskHeatmap />

        {/* Right Column: Category Distribution & KRI Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Risk by Category Breakdown */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <PieChart size={17} color="var(--brand-primary)" />
                <span>Risks by Taxonomy Category</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoryCounts.map(cat => {
                const pct = totalRisks ? Math.round((cat.count / totalRisks) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {cat.count} risks ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background:
                            cat.name === 'Operational'
                              ? '#006ec7'
                              : cat.name === 'Financial'
                              ? '#059669'
                              : cat.name === 'Strategic'
                              ? '#ea580c'
                              : cat.name === 'Cyber/Tech'
                              ? '#7c3aed'
                              : '#0284c7'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Risk Indicators (KRIs) Snapshot */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Activity size={17} color="var(--brand-primary)" />
                <span>Key Risk Indicators (KRIs)</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('kris')}>
                View All KRIs
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {kris.slice(0, 3).map(kri => (
                <div
                  key={kri.id}
                  style={{
                    padding: '11px 14px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {kri.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Target: {kri.target} • Owner: {kri.owner}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: kri.status === 'Green' ? '#16a34a' : kri.status === 'Amber' ? '#d97706' : '#dc2626' }}>
                      {kri.currentValue}{kri.unit === '%' ? '%' : ''}
                    </div>
                    <span className={`badge ${kri.status === 'Green' ? 'badge-low' : kri.status === 'Amber' ? 'badge-medium' : 'badge-critical'}`}>
                      {kri.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Risks Priority Action Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldAlert size={18} color="var(--risk-critical)" />
            <span>High & Critical Risk Priority Watchlist</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('risks')}>
            Full Risk Register <ArrowRight size={14} />
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Risk Code & Title</th>
                <th>Branch</th>
                <th>Category</th>
                <th>Inherent Risk</th>
                <th>Control Eff.</th>
                <th>Residual Risk</th>
                <th>Financial Exposure</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.filter(r => r.residualScore >= 8).slice(0, 5).map(risk => (
                <tr
                  key={risk.id}
                  onClick={() => setSelectedRiskForDrawer(risk)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--brand-primary)', marginRight: 6 }}>{risk.code}</span>
                      {risk.title}
                    </div>
                  </td>
                  <td>{risk.branchName}</td>
                  <td><span className="badge badge-muted">{risk.category}</span></td>
                  <td>
                    <span className={`badge ${risk.inherentScore >= 16 ? 'badge-critical' : risk.inherentScore >= 10 ? 'badge-high' : 'badge-medium'}`}>
                      {risk.inherentLevel} ({risk.inherentScore})
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--brand-primary)' }}>{risk.controlEffectiveness}%</strong>
                  </td>
                  <td>
                    <span className={`badge ${risk.residualScore >= 16 ? 'badge-critical' : risk.residualScore >= 10 ? 'badge-high' : 'badge-medium'}`}>
                      {risk.residualLevel} ({risk.residualScore})
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{formatZMW(risk.financialExposureZMW)}</strong></td>
                  <td>{risk.owner}</td>
                  <td>
                    <span className={`badge ${risk.status === 'Escalated' ? 'badge-critical' : 'badge-low'}`}>
                      {risk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
