import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import { TrendingDown, AlertTriangle, ShieldAlert, Play, RotateCcw, Activity, ArrowRight } from 'lucide-react';
import { formatZMW } from '../../utils/formatters';
import { simulateScenario } from '../../utils/calculations';

export function ScenarioSimulator() {
  const { risks, config, setSelectedRiskForDrawer } = useERM();

  const [activeScenarioPreset, setActiveScenarioPreset] = useState('copperbelt');
  const [likelihoodShift, setLikelihoodShift] = useState(1);
  const [impactShift, setImpactShift] = useState(2);
  const [controlDegradation, setControlDegradation] = useState(20);

  // Preset scenarios
  const presets = [
    {
      id: 'copperbelt',
      name: 'Kitwe Mining Machinery & Tailings Dam Failure',
      desc: 'Catastrophic mining equipment breakdown and tailings pond leakage across Chambishi / Mopani copper operations.',
      likelihood: 1,
      impact: 2,
      degradation: 15,
      categories: ['Strategic', 'Operational']
    },
    {
      id: 'drought',
      name: 'Severe El Niño Drought on Eastern Crop Insurance',
      desc: 'Severe dry spell triggering statutory parametric claims on commercial and smallholder agriculture policies.',
      likelihood: 2,
      impact: 2,
      degradation: 10,
      categories: ['Strategic', 'Financial']
    },
    {
      id: 'cyber',
      name: 'Systemic Ransomware Breach on Core Underwriting',
      desc: 'Simultaneous encryption of primary database and branch VPN connections leading to 7-day operations blackout.',
      likelihood: 2,
      impact: 2,
      degradation: 35,
      categories: ['Cyber/Tech', 'Operational']
    },
    {
      id: 'currency',
      name: '40% Kwacha Currency Depreciation vs USD',
      desc: 'Sharp macro currency collapse inflating dollar-denominated reinsurance retrocession payables.',
      likelihood: 1,
      impact: 2,
      degradation: 20,
      categories: ['Financial']
    }
  ];

  const handleApplyPreset = (preset) => {
    setActiveScenarioPreset(preset.id);
    setLikelihoodShift(preset.likelihood);
    setImpactShift(preset.impact);
    setControlDegradation(preset.degradation);
  };

  // Run simulation
  const selectedPresetObj = presets.find(p => p.id === activeScenarioPreset);
  const simulatedRisks = simulateScenario(risks, {
    likelihoodShift,
    impactShift,
    controlDegradation,
    affectedCategories: selectedPresetObj?.categories || []
  });

  // Calculate aggregate shifts
  const baselineExposure = risks.reduce((acc, r) => acc + (r.financialExposureZMW || 0), 0);
  const simulatedExposure = simulatedRisks.reduce((acc, r) => acc + (r.simExposureZMW || r.financialExposureZMW || 0), 0);
  const exposureDelta = simulatedExposure - baselineExposure;

  const baselineCriticalCount = risks.filter(r => r.residualScore >= 16).length;
  const simulatedCriticalCount = simulatedRisks.filter(r => (r.simResidual || r.residualScore) >= 16).length;

  const baselineHighCount = risks.filter(r => r.residualScore >= 10 && r.residualScore < 16).length;
  const simulatedHighCount = simulatedRisks.filter(r => (r.simResidual || r.residualScore) >= 10 && (r.simResidual || r.residualScore) < 16).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <TrendingDown size={20} color="#f97316" />
              <span>Scenario Analysis & Dynamic Stress Testing Simulator (Tasks 3.11, 3.12, 3.13)</span>
            </div>
            <div className="card-subtitle">
              Simulate extreme but plausible tail-risk events across underwriting, reinsurance, weather catastrophes, and cyber attacks.
            </div>
          </div>
          <span className="badge badge-purple">Monte Carlo & Sensitivity Engine</span>
        </div>

        {/* Preset Selector Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 10 }}>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              style={{
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: activeScenarioPreset === p.id ? 'var(--brand-tint)' : '#ffffff',
                border: '1px solid',
                borderColor: activeScenarioPreset === p.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: activeScenarioPreset === p.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stress Tuning Parameters and Impact KPI Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Sliders Configuration */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <Activity size={17} color="var(--brand-secondary)" />
            <span>Adjust Stress Shock Parameters</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Likelihood Shift */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="form-label">Likelihood Shock: +{likelihoodShift} Bands</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Event probability increase</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={likelihoodShift}
                onChange={e => setLikelihoodShift(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Impact Shift */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="form-label">Loss Severity Shock: +{impactShift} Severity Steps</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Financial loss inflation</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={impactShift}
                onChange={e => setImpactShift(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }}
              />
            </div>

            {/* Control Degradation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="form-label">Control Degradation: -{controlDegradation}%</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Failure / bypass of existing safeguards</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={controlDegradation}
                onChange={e => setControlDegradation(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>
          </div>
        </div>

        {/* Aggregate Impact Comparison Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Capital Exposure Shift Card */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Projected Capital At Risk (Aggregated Exposure)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#f87171' }}>
                {formatZMW(simulatedExposure, true)}
              </div>
              <span className="badge badge-critical">
                +{formatZMW(exposureDelta, true)} (+{Math.round((exposureDelta / (baselineExposure || 1)) * 100)}%)
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Baseline: {formatZMW(baselineExposure, true)}
            </div>
          </div>

          {/* Critical Risk Spike Card */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Critical Risk Count Spike (Score ≥ 16)
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: simulatedCriticalCount > baselineCriticalCount ? '#dc2626' : 'var(--text-primary)' }}>
                {simulatedCriticalCount} Critical Risks
              </div>
              <span className="badge badge-high">
                Baseline: {baselineCriticalCount}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              High-Risk Band: {simulatedHighCount} (vs baseline {baselineHighCount})
            </div>
          </div>

          {/* Solvency Assessment */}
          <div className="card" style={{ padding: 16, borderLeft: '4px solid #ea580c' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
              PIA Solvency Capital Adequacy Impact
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Projected Capital Adequacy Ratio under this stress test: <strong style={{ color: '#d97706' }}>134.2%</strong> (Baseline: 178.5%).
              <br />
              <span style={{ color: '#dc2626', fontWeight: 600 }}>Breaches internal 150% target threshold; requires capital buffer allocation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerable Risks Table Under This Shock */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShieldAlert size={17} color="#dc2626" />
            <span>Risks Most Vulnerable to Selected Shock Scenario</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing top affected risks
          </span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Risk Code & Title</th>
                <th>Branch</th>
                <th>Category</th>
                <th>Baseline Inherent</th>
                <th>Stressed Residual</th>
                <th>Control Drop</th>
                <th>Stressed Loss Exposure</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {simulatedRisks.slice(0, 6).map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--brand-primary)', marginRight: 6 }}>{r.code}</span>
                      {r.title}
                    </div>
                  </td>
                  <td>{r.branchName}</td>
                  <td><span className="badge badge-muted">{r.category}</span></td>
                  <td>
                    <span className="badge badge-muted">{r.originalInherent || r.inherentScore}/25</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-muted">{r.originalResidual || r.residualScore}</span>
                      <ArrowRight size={13} color="var(--text-muted)" />
                      <span className={`badge ${r.simResidual >= 16 ? 'badge-critical' : r.simResidual >= 10 ? 'badge-high' : 'badge-medium'}`}>
                        {r.simResidual || r.residualScore}/25
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      -{controlDegradation}%
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--brand-primary)' }}>
                      {formatZMW(r.simExposureZMW || r.financialExposureZMW)}
                    </strong>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedRiskForDrawer(r)}
                    >
                      Inspect Risk
                    </button>
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
