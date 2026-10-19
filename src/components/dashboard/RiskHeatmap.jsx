import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import { LIKELIHOOD_LEVELS, IMPACT_LEVELS, calcInherentRisk } from '../../utils/calculations';
import { Shield, Eye, Filter, ArrowRight } from 'lucide-react';
import { formatZMW } from '../../utils/formatters';

export function RiskHeatmap({ onSelectRisk }) {
  const { filteredRisks, setSelectedRiskForDrawer } = useERM();
  const [matrixView, setMatrixView] = useState('residual'); // 'inherent' | 'residual'
  const [selectedCell, setSelectedCell] = useState(null); // { likelihood: 4, impact: 5 }

  // Count risks in each matrix cell
  const getRisksInCell = (l, i) => {
    return filteredRisks.filter(r => {
      const rLikelihood = matrixView === 'inherent' ? r.inherentLikelihood : (r.residualLikelihood || Math.max(1, Math.round(r.inherentLikelihood * (1 - r.controlEffectiveness / 200))));
      const rImpact = matrixView === 'inherent' ? r.inherentImpact : (r.residualImpact || Math.max(1, Math.round(r.inherentImpact * (1 - r.controlEffectiveness / 150))));
      return rLikelihood === l && rImpact === i;
    });
  };

  // Determine cell background color (Accessible light theme)
  const getCellBg = (l, i) => {
    const score = l * i;
    if (score >= 16) return { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', countText: '#991b1b' };
    if (score >= 10) return { bg: '#ffedd5', border: '#fed7aa', text: '#c2410c', countText: '#9a3412' };
    if (score >= 5) return { bg: '#fef9c3', border: '#fde68a', text: '#b45309', countText: '#854d0e' };
    return { bg: '#dcfce7', border: '#bbf7d0', text: '#15803d', countText: '#166534' };
  };

  // Filtered risks for current cell selection
  const cellRisks = selectedCell ? getRisksInCell(selectedCell.likelihood, selectedCell.impact) : [];

  return (
    <div className="card">
      {/* Header and Toggle */}
      <div className="card-header" style={{ flexWrap: 'wrap' }}>
        <div>
          <div className="card-title">
            <Shield size={18} color="var(--brand-primary)" />
            <span>5×5 Likelihood vs Impact Risk Heatmap</span>
          </div>
          <div className="card-subtitle">
            Interactive risk exposure landscape plotted from live risk register records. Click any cell to inspect matching risks.
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${matrixView === 'residual' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setMatrixView('residual'); setSelectedCell(null); }}
          >
            Residual Risk (Post-Control)
          </button>
          <button
            className={`btn btn-sm ${matrixView === 'inherent' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setMatrixView('inherent'); setSelectedCell(null); }}
          >
            Inherent Risk (Pre-Control)
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div style={{ overflowX: 'auto', padding: '10px 0' }}>
        <div style={{ minWidth: 540 }}>
          {/* Column Impact Headers (1 to 5) */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', gap: 6, marginBottom: 4 }}>
            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
              LIKELIHOOD \ IMPACT
            </div>
            {IMPACT_LEVELS.map(imp => (
              <div key={imp.value} className="heatmap-col-header">
                <div>{imp.value} - {imp.label}</div>
              </div>
            ))}
          </div>

          {/* Rows: Likelihood from 5 (Almost Certain) down to 1 (Rare) */}
          {[5, 4, 3, 2, 1].map(lVal => {
            const lInfo = LIKELIHOOD_LEVELS.find(l => l.value === lVal);

            return (
              <div
                key={lVal}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px repeat(5, 1fr)',
                  gap: 6,
                  marginBottom: 6
                }}
              >
                {/* Row Header */}
                <div className="heatmap-row-header">
                  <span style={{ textAlign: 'right', lineHeight: 1.2 }}>
                    <strong>{lVal}</strong> - {lInfo?.label}
                  </span>
                </div>

                {/* Cells 1 to 5 Impact */}
                {[1, 2, 3, 4, 5].map(iVal => {
                  const matching = getRisksInCell(lVal, iVal);
                  const count = matching.length;
                  const score = lVal * iVal;
                  const styling = getCellBg(lVal, iVal);
                  const isSelected = selectedCell?.likelihood === lVal && selectedCell?.impact === iVal;

                  return (
                    <div
                      key={iVal}
                      className={`heatmap-cell ${isSelected ? 'active-filter' : ''}`}
                      onClick={() => setSelectedCell({ likelihood: lVal, impact: iVal })}
                      style={{
                        background: styling.bg,
                        borderColor: isSelected ? 'var(--brand-primary)' : styling.border
                      }}
                      title={`Likelihood ${lVal} × Impact ${iVal} = Score ${score}. Contains ${count} risks.`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="heatmap-score" style={{ color: styling.text }}>
                          {score}
                        </span>
                        {count > 0 && (
                          <span style={{ fontSize: 9.5, color: styling.text, fontWeight: 600 }}>
                            {count} risk{count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="heatmap-count" style={{ color: count > 0 ? styling.countText : '#94a3b8' }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 12,
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 600 }}>Risk Bands:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-critical)' }} />
            Critical (16 - 25)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-high)' }} />
            High (10 - 15)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-medium)' }} />
            Medium (5 - 9)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--risk-low)' }} />
            Low (1 - 4)
          </span>
        </div>

        <div>
          Showing: <strong>{filteredRisks.length}</strong> total risks plotted
        </div>
      </div>

      {/* Selected Cell Drill-down table */}
      {selectedCell && (
        <div
          style={{
            marginTop: 18,
            padding: 16,
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={15} color="var(--brand-primary)" />
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                Risks at Likelihood {selectedCell.likelihood} × Impact {selectedCell.impact} (Score: {selectedCell.likelihood * selectedCell.impact})
              </span>
              <span className="badge badge-info">{cellRisks.length} record{cellRisks.length > 1 ? 's' : ''}</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedCell(null)}
            >
              Clear Filter
            </button>
          </div>

          {cellRisks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cellRisks.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRiskForDrawer(r)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{r.code}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {r.branchName} • Owner: {r.owner} • Exposure: {formatZMW(r.financialExposureZMW)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge badge-${r.residualLevel.toLowerCase()}`}>
                      Residual: {r.residualScore}
                    </span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No risks currently mapped to this exact matrix cell.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
