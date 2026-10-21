import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  ShieldAlert,
  Search,
  Filter,
  PlusCircle,
  Download,
  Trash2,
  AlertTriangle,
  Eye,
  SlidersHorizontal,
  Building2,
  X,
  RotateCcw
} from 'lucide-react';
import { formatZMW, formatDate, exportToCSV } from '../../utils/formatters';

export function RiskRegister() {
  const {
    filteredRisks,
    deleteRisk,
    setSelectedRiskForDrawer,
    setActiveTab,
    branches
  } = useERM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('residualScore'); // 'residualScore' | 'inherentScore' | 'financialExposureZMW' | 'code'

  // Filter logic
  const displayedRisks = filteredRisks.filter(risk => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      risk.title.toLowerCase().includes(q) ||
      risk.code.toLowerCase().includes(q) ||
      risk.owner.toLowerCase().includes(q) ||
      risk.description.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'ALL' || risk.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'ALL' || risk.residualLevel === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || risk.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Sort logic
  displayedRisks.sort((a, b) => {
    if (sortBy === 'residualScore') return b.residualScore - a.residualScore;
    if (sortBy === 'inherentScore') return b.inherentScore - a.inherentScore;
    if (sortBy === 'financialExposureZMW') return (b.financialExposureZMW || 0) - (a.financialExposureZMW || 0);
    return a.code.localeCompare(b.code);
  });

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCategory !== 'ALL' ||
    selectedSeverity !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    sortBy !== 'residualScore'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSortBy('residualScore');
  };

  const handleExportCSV = () => {
    const rows = displayedRisks.map(r => ({
      Code: r.code,
      Title: r.title,
      Category: r.category,
      Subcategory: r.subcategory,
      Branch: r.branchName,
      InherentScore: r.inherentScore,
      InherentLevel: r.inherentLevel,
      ControlEffectiveness: `${r.controlEffectiveness}%`,
      ResidualScore: r.residualScore,
      ResidualLevel: r.residualLevel,
      ExposureZMW: r.financialExposureZMW,
      Tolerance: r.toleranceStatus,
      Owner: r.owner,
      Status: r.status,
      LastAssessed: r.lastAssessed
    }));
    exportToCSV(`Apex_Corporate_Risk_Register_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Corporate Risk Register (Section 5.1 - 5.3)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Centralized multi-branch repository of identified, assessed, and monitored organizational risks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('risk-identify')}>
            <PlusCircle size={15} />
            <span>Identify New Risk</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={15} />
            <span>Export Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* Full Length Search & Horizontal Filters Card */}
      <div className="risk-filter-card">
        {/* Full-width Search Bar */}
        <div className="risk-search-bar">
          <Search size={16} className="risk-search-icon" />
          <input
            type="text"
            className="risk-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search risk by title, code, owner, description..."
          />
          {searchQuery && (
            <button
              type="button"
              className="risk-search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search query"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Horizontal Filter Dropdowns Row */}
        <div className="risk-filters-row">
          {/* Category */}
          <select
            className={`risk-filter-select ${selectedCategory !== 'ALL' ? 'is-active' : ''}`}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            aria-label="Filter by Category"
          >
            <option value="ALL">All Categories</option>
            <option value="Operational">Operational</option>
            <option value="Financial">Financial</option>
            <option value="Compliance">Compliance</option>
            <option value="Strategic">Strategic</option>
            <option value="Cyber/Tech">Cyber/Tech</option>
            <option value="Reputational">Reputational</option>
          </select>

          {/* Severity */}
          <select
            className={`risk-filter-select ${selectedSeverity !== 'ALL' ? 'is-active' : ''}`}
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            aria-label="Filter by Severity"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical (≥ 16)</option>
            <option value="High">High (10 - 15)</option>
            <option value="Medium">Medium (5 - 9)</option>
            <option value="Low">Low (&lt; 5)</option>
          </select>

          {/* Status */}
          <select
            className={`risk-filter-select ${selectedStatus !== 'ALL' ? 'is-active' : ''}`}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Escalated">Escalated</option>
          </select>

          {/* Sort By */}
          <select
            className={`risk-filter-select ${sortBy !== 'residualScore' ? 'is-active' : ''}`}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort Risk Register"
          >
            <option value="residualScore">Sort by Residual Score</option>
            <option value="inherentScore">Sort by Inherent Score</option>
            <option value="financialExposureZMW">Sort by Financial Exposure</option>
            <option value="code">Sort by Risk Code</option>
          </select>
        </div>

        {/* Active Filters Pill Bar (shown only when filters or search are active) */}
        {hasActiveFilters && (
          <div className="risk-active-filters-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                Active filters ({displayedRisks.length} result{displayedRisks.length === 1 ? '' : 's'}):
              </span>
              {searchQuery && (
                <span className="risk-filter-tag">
                  Query: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')} title="Remove search filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selectedCategory !== 'ALL' && (
                <span className="risk-filter-tag">
                  Category: {selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory('ALL')} title="Remove category filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selectedSeverity !== 'ALL' && (
                <span className="risk-filter-tag">
                  Severity: {selectedSeverity}
                  <button type="button" onClick={() => setSelectedSeverity('ALL')} title="Remove severity filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selectedStatus !== 'ALL' && (
                <span className="risk-filter-tag">
                  Status: {selectedStatus}
                  <button type="button" onClick={() => setSelectedStatus('ALL')} title="Remove status filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {sortBy !== 'residualScore' && (
                <span className="risk-filter-tag">
                  Sorted by: {sortBy === 'inherentScore' ? 'Inherent Score' : sortBy === 'financialExposureZMW' ? 'Financial Exposure' : 'Risk Code'}
                  <button type="button" onClick={() => setSortBy('residualScore')} title="Reset sort">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brand-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* Risk Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Risk Code & Title</th>
              <th>Category</th>
              <th>Branch</th>
              <th>Inherent (L×I)</th>
              <th>Controls</th>
              <th>Residual Score</th>
              <th>Exposure (ZMW)</th>
              <th>Tolerance</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedRisks.length > 0 ? (
              displayedRisks.map(risk => (
                <tr key={risk.id}>
                  <td style={{ minWidth: 340 }}>
                    <div
                      onClick={() => setSelectedRiskForDrawer(risk)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span className="risk-code-pill">{risk.code}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                          {risk.title}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {risk.subcategory} • Assessed: {formatDate(risk.lastAssessed)}
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge badge-muted">{risk.category}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {risk.branchName.replace(' Head Office & Main Branch', ' (HQ)').replace(' Branch', '')}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge ${risk.inherentScore >= 16 ? 'badge-critical' : risk.inherentScore >= 10 ? 'badge-high' : 'badge-medium'}`} style={{ whiteSpace: 'nowrap' }}>
                      {risk.inherentLevel} ({risk.inherentScore})
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--brand-primary)' }}>{risk.controlEffectiveness}%</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        ({(risk.linkedControlIds || []).length} linked)
                      </span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge ${risk.residualScore >= 16 ? 'badge-critical' : risk.residualScore >= 10 ? 'badge-high' : 'badge-medium'}`} style={{ whiteSpace: 'nowrap' }}>
                      {risk.residualLevel} ({risk.residualScore})
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{formatZMW(risk.financialExposureZMW, true)}</strong>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        color: risk.toleranceStatus === 'Within Appetite' ? '#16a34a' : '#dc2626'
                      }}
                    >
                      {risk.toleranceStatus}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {risk.owner.split(' ')[0]} {risk.owner.split(' ')[1] || ''}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge ${risk.status === 'Escalated' ? 'badge-critical' : risk.status === 'Approved' ? 'badge-low' : 'badge-info'}`} style={{ whiteSpace: 'nowrap' }}>
                      {risk.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedRiskForDrawer(risk)}
                        title="Inspect & Edit Scoring"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => deleteRisk(risk.id)}
                        title="Delete Risk Record"
                        style={{ color: '#dc2626', borderColor: '#fecaca' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                  No risks matched your current filters. Clear filters or add a new risk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>Showing {displayedRisks.length} of {filteredRisks.length} total risk records</span>
        <span>Corporate consolidation: Live real-time sync</span>
      </div>
    </div>
  );
}
