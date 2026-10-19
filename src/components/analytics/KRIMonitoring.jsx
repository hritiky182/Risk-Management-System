import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Activity,
  Server,
  DollarSign,
  Car,
  ShieldAlert,
  RefreshCw,
  Filter,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  User,
  Radio,
  FileCheck
} from 'lucide-react';
import { formatZMW } from '../../utils/formatters';

export function KRIMonitoring() {
  const { kris, setKris, showToast, addAuditLog } = useERM();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [selectedView, setSelectedView] = useState('kri'); // 'kri' | 'kci' | 'combined'

  // Historical trend data for 6-month sparklines
  const sparklineData = {
    'KRI-01': [58.2, 59.5, 62.1, 64.0, 66.8, 68.4],
    'KRI-02': [182.0, 180.5, 179.0, 181.2, 178.0, 178.5],
    'KRI-03': [5800000, 5600000, 5200000, 5100000, 4950000, 4850000],
    'KRI-04': [99.95, 99.91, 99.88, 99.79, 99.85, 99.82],
    'KRI-05': [3.2, 3.8, 4.5, 5.1, 6.2, 6.8]
  };

  // Key Control Indicators (KCIs - Task 8.7)
  const [kciList, setKciList] = useState([
    {
      id: 'KCI-01',
      code: 'KCI-01',
      name: 'Dual Loss Adjuster Signoff on Claims > ZMW 50K',
      target: '≥ 90.0%',
      currentValue: 94.2,
      testedCount: '158 of 168 Claims Dual-Signed',
      status: 'Effective',
      category: 'Claims Governance',
      frequency: 'Weekly Sample',
      owner: 'Internal Audit & Claims Compliance',
      lastAssessed: '15 Oct 2026',
      linkedControl: 'CTL-OPS-01'
    },
    {
      id: 'KCI-02',
      code: 'KCI-02',
      name: 'Real-Time Policyholder Sanctions & PEP Screening Rate',
      target: '≥ 95.0%',
      currentValue: 84.0,
      testedCount: '1,420 of 1,690 Quotes Filtered',
      status: 'Needs Attention',
      category: 'AML / Regulatory',
      frequency: 'Daily Telemetry',
      owner: 'Compliance & Anti-Financial Crime Lead',
      lastAssessed: '18 Oct 2026',
      linkedControl: 'CTL-COMP-01'
    },
    {
      id: 'KCI-03',
      code: 'KCI-03',
      name: 'Core Underwriting Database Backup & Disaster Recovery RTO',
      target: '100% Passed',
      currentValue: 100.0,
      testedCount: 'Full RTO Failover Verified < 15 Min',
      status: 'Effective',
      category: 'IT Continuity',
      frequency: 'Monthly Simulation',
      owner: 'IT Systems & Infrastructure Head',
      lastAssessed: '10 Oct 2026',
      linkedControl: 'CTL-TECH-01'
    },
    {
      id: 'KCI-04',
      code: 'KCI-04',
      name: 'Panel Beater Invoice Digital Price Catalogue Enforcement',
      target: '≥ 80.0%',
      currentValue: 62.5,
      testedCount: '85 of 136 Lusaka Invoices Verified',
      status: 'High Deficiency',
      category: 'Procurement Integrity',
      frequency: 'Weekly Sample',
      owner: 'Motor Claims Inspection Manager',
      lastAssessed: '12 Oct 2026',
      linkedControl: 'CTL-OPS-02'
    }
  ]);

  // Update KRI value and recalculate status
  const handleUpdateValue = (id, newVal) => {
    setKris(prev =>
      prev.map(k => {
        if (k.id !== id) return k;
        const val = Number(newVal);
        let status = 'Green';

        if (k.id === 'KRI-02') {
          // Solvency: higher is safer (> 150% target)
          if (val < k.thresholdRed) status = 'Red';
          else if (val < k.thresholdAmber) status = 'Amber';
          else status = 'Green';
        } else if (k.id === 'KRI-04') {
          // IT Availability: higher is better (> 99.9% target)
          if (val < k.thresholdRed) status = 'Red';
          else if (val < k.thresholdAmber) status = 'Amber';
          else status = 'Green';
        } else {
          // Loss ratio, Debtors, Fraud: lower is safer
          if (val > k.thresholdRed) status = 'Red';
          else if (val > k.thresholdAmber) status = 'Amber';
          else status = 'Green';
        }

        return { ...k, currentValue: val, status };
      })
    );
  };

  // Quick simulation presets
  const handleApplyPreset = (id, mode) => {
    const kri = kris.find(k => k.id === id);
    if (!kri) return;

    let targetVal = kri.currentValue;

    if (id === 'KRI-01') {
      // Motor Loss Ratio
      if (mode === 'baseline') targetVal = 59.5;
      else if (mode === 'minus') targetVal = Math.max(30, kri.currentValue - 5);
      else if (mode === 'plus') targetVal = Math.min(95, kri.currentValue + 5);
      else if (mode === 'shock') targetVal = 78.5;
    } else if (id === 'KRI-02') {
      // Solvency
      if (mode === 'baseline') targetVal = 178.5;
      else if (mode === 'minus') targetVal = Math.max(100, kri.currentValue - 10);
      else if (mode === 'plus') targetVal = Math.min(220, kri.currentValue + 10);
      else if (mode === 'shock') targetVal = 118.0;
    } else if (id === 'KRI-03') {
      // Broker Receivables
      if (mode === 'baseline') targetVal = 2100000;
      else if (mode === 'minus') targetVal = Math.max(1000000, kri.currentValue - 500000);
      else if (mode === 'plus') targetVal = Math.min(7500000, kri.currentValue + 500000);
      else if (mode === 'shock') targetVal = 6200000;
    } else if (id === 'KRI-04') {
      // IT Availability
      if (mode === 'baseline') targetVal = 99.95;
      else if (mode === 'minus') targetVal = Math.max(95, Number((kri.currentValue - 0.5).toFixed(2)));
      else if (mode === 'plus') targetVal = Math.min(100, Number((kri.currentValue + 0.2).toFixed(2)));
      else if (mode === 'shock') targetVal = 97.4;
    } else if (id === 'KRI-05') {
      // Fraud trigger rate
      if (mode === 'baseline') targetVal = 3.2;
      else if (mode === 'minus') targetVal = Math.max(1, Number((kri.currentValue - 1).toFixed(1)));
      else if (mode === 'plus') targetVal = Math.min(15, Number((kri.currentValue + 1).toFixed(1)));
      else if (mode === 'shock') targetVal = 9.8;
    }

    handleUpdateValue(id, targetVal);
    showToast('Simulation Applied', `Adjusted ${kri.code} to ${targetVal}${kri.unit === '%' ? '%' : ''}`, 'info');
  };

  // Test KCI record
  const handleTestKCI = (id) => {
    setKciList(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              currentValue: Math.min(100, Number((c.currentValue + 3).toFixed(1))),
              lastAssessed: new Date().toISOString().slice(0, 10),
              status: c.currentValue >= 85 ? 'Effective' : 'Needs Attention'
            }
          : c
      )
    );
    showToast('Control Test Recorded', `Operational test re-verified for ${id}. Score updated.`, 'success');
  };

  // Filter KRIs by selected domain
  const filteredKRIs = kris.filter(k => {
    if (activeCategoryFilter === 'ALL') return true;
    return k.category.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  // Calculate summary metrics
  const totalCount = kris.length;
  const greenCount = kris.filter(k => k.status === 'Green').length;
  const amberCount = kris.filter(k => k.status === 'Amber').length;
  const redCount = kris.filter(k => k.status === 'Red').length;
  const healthScore = Math.round(((greenCount * 1.0 + amberCount * 0.5) / totalCount) * 100);

  // Helper: render SVG sparkline curve
  const renderSparkline = (dataArr, statusColor) => {
    if (!dataArr || dataArr.length < 2) return null;
    const minVal = Math.min(...dataArr) * 0.98;
    const maxVal = Math.max(...dataArr) * 1.02;
    const range = maxVal - minVal || 1;
    const width = 120;
    const height = 34;

    const points = dataArr.map((val, idx) => {
      const x = (idx / (dataArr.length - 1)) * (width - 12) + 6;
      const y = height - 6 - ((val - minVal) / range) * (height - 12);
      return { x, y };
    });

    const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;
    const lastPoint = points[points.length - 1];

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${statusColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={statusColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={statusColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${statusColor.replace('#', '')})`} />
        <path d={pathD} fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3.5" fill="#ffffff" stroke={statusColor} strokeWidth="2" />
      </svg>
    );
  };

  // Helper: calculate tolerance meter pin position
  const getMeterPinPercent = (kri) => {
    if (kri.unit === 'ZMW') {
      const min = 1000000;
      const max = 7000000;
      return Math.max(3, Math.min(97, ((kri.currentValue - min) / (max - min)) * 100));
    }
    if (kri.id === 'KRI-02') {
      // CAR: 100 to 220
      return Math.max(3, Math.min(97, ((kri.currentValue - 100) / 120) * 100));
    }
    if (kri.id === 'KRI-04') {
      // SLA: 97.0 to 100.0
      return Math.max(3, Math.min(97, ((kri.currentValue - 97) / 3) * 100));
    }
    // Default percentage (e.g. 20 to 100 or 0 to 15)
    if (kri.id === 'KRI-05') {
      return Math.max(3, Math.min(97, (kri.currentValue / 12) * 100));
    }
    return Math.max(3, Math.min(97, ((kri.currentValue - 30) / 60) * 100));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Title Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              Key Risk Indicators (KRIs) & Key Control Indicators (KCIs)
            </h1>
            <span className="badge badge-purple" style={{ textTransform: 'uppercase', fontSize: 10.5 }}>
              Tender Sections 8.6 & 8.7
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            Continuous operational early-warning telemetry, threshold calibration, and control effectiveness tracking.
          </p>
        </div>

        {/* Live Continuous Telemetry Connection Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 14px',
            background: '#ffffff',
            borderRadius: 30,
            border: '1px solid #bae6fd',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span className="kri-pulse-dot green" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0369a1' }}>
            Live Sensor & Webhook Telemetry Active
          </span>
        </div>
      </div>

      {/* Overview Telemetry KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid var(--brand-primary)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Monitored Telemetry Feeds
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active KRIs</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--brand-primary)', marginTop: 4, fontWeight: 600 }}>
            Automated Daily & Monthly Sampling
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Within Tolerance Band
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>{greenCount}</span>
            <span className="badge badge-low">{Math.round((greenCount / totalCount) * 100)}%</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Optimal Operating Parameters
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Early Warning Watchlist
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#d97706' }}>{amberCount}</span>
            <span className="badge badge-high">{Math.round((amberCount / totalCount) * 100)}%</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Proactive Attention Mandated
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Critical Tolerance Breaches
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>{redCount}</span>
            <span className="badge badge-critical">{Math.round((redCount / totalCount) * 100)}%</span>
          </div>
          <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 4, fontWeight: 600 }}>
            Escalation Action Triggered
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Composite Risk Health
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-primary)' }}>{healthScore}%</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 100.0</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Overall System Stability Index
          </div>
        </div>
      </div>

      {/* View Switcher & Domain Filtering Toolbar */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        {/* Domain category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Telemetry Indicators', count: kris.length },
            { id: 'Operational', label: 'Operational Risk', count: 2 },
            { id: 'Regulatory', label: 'Regulatory & Solvency', count: 1 },
            { id: 'Financial', label: 'Financial Debtors', count: 1 },
            { id: 'Technology', label: 'IT Availability', count: 1 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id)}
              className={`btn btn-sm ${activeCategoryFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 10.5,
                  background: activeCategoryFilter === tab.id ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                  color: activeCategoryFilter === tab.id ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Section View Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-sm ${selectedView === 'kri' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedView('kri')}
          >
            <Gauge size={13} />
            <span>KRIs Early Warning ({kris.length})</span>
          </button>
          <button
            className={`btn btn-sm ${selectedView === 'kci' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedView('kci')}
          >
            <ShieldCheck size={13} />
            <span>KCIs Control Health ({kciList.length})</span>
          </button>
          <button
            className={`btn btn-sm ${selectedView === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedView('combined')}
          >
            <span>Combined View</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KRI METRIC CARDS GRID */}
      {(selectedView === 'kri' || selectedView === 'combined') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gauge size={17} color="var(--brand-primary)" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Key Risk Indicators (KRIs) Telemetry Portfolio
              </h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filteredKRIs.length} monitored indicators
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
            {filteredKRIs.map(kri => {
              const isRed = kri.status === 'Red';
              const isAmber = kri.status === 'Amber';
              const statusColor = isRed ? '#dc2626' : isAmber ? '#d97706' : '#16a34a';
              const statusBg = isRed ? '#fef2f2' : isAmber ? '#fffbeb' : '#f0fdf4';
              const statusBorder = isRed ? '#fecaca' : isAmber ? '#fde68a' : '#bbf7d0';
              const statusPulseClass = isRed ? 'red' : isAmber ? 'amber' : 'green';

              const pinPercent = getMeterPinPercent(kri);
              const historyData = sparklineData[kri.id] || [50, 52, 54, 56, 58, 60];

              // Pick domain icon
              let DomainIcon = Activity;
              if (kri.category === 'Operational') DomainIcon = Car;
              else if (kri.category === 'Regulatory') DomainIcon = ShieldCheck;
              else if (kri.category === 'Financial') DomainIcon = DollarSign;
              else if (kri.category === 'Technology') DomainIcon = Server;

              return (
                <div
                  key={kri.id}
                  className="card"
                  style={{
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderTop: `4px solid ${statusColor}`,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    {/* Card Header: Category + Code + Pulse Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <DomainIcon size={15} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="risk-code-pill">{kri.code}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                              {kri.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator with live pulse dot */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: statusBg,
                          border: `1px solid ${statusBorder}`,
                          fontSize: 11,
                          fontWeight: 700,
                          color: statusColor
                        }}
                      >
                        <span className={`kri-pulse-dot ${statusPulseClass}`} />
                        <span>{isRed ? 'Critical Breach' : isAmber ? 'Warning Alert' : 'Within Tolerance'}</span>
                      </div>
                    </div>

                    {/* Indicator Name */}
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>
                      {kri.name}
                    </h3>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
                      Sampling Frequency: <strong style={{ color: 'var(--text-secondary)' }}>{kri.frequency}</strong> • Target Limit: <strong style={{ color: 'var(--brand-primary)' }}>{kri.target}</strong>
                    </div>

                    {/* Hero Value + Target + Mini Trend Sparkline */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: 16
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>
                          Current Live Value
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 800, color: statusColor, lineHeight: 1 }}>
                          {kri.unit === 'ZMW' ? formatZMW(kri.currentValue, true) : `${kri.currentValue}${kri.unit}`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          {kri.trend === 'up' && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: isRed || isAmber ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center' }}>
                              <ArrowUpRight size={13} /> +2.4% vs last cycle
                            </span>
                          )}
                          {kri.trend === 'down' && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center' }}>
                              <ArrowDownRight size={13} /> -1.8% improving
                            </span>
                          )}
                          {kri.trend === 'stable' && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                              <Minus size={13} /> Stable within ±0.2%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 6-Month Trajectory Sparkline Curve */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>
                          6-Month Trend
                        </div>
                        {renderSparkline(historyData, statusColor)}
                      </div>
                    </div>

                    {/* Continuous Multi-Zone Tolerance Spectrum Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Tolerance Spectrum</span>
                        <span style={{ fontWeight: 600, color: statusColor }}>
                          Position: {Math.round(pinPercent)}% of Range
                        </span>
                      </div>

                      {/* Segmented Gradient Bar */}
                      <div
                        style={{
                          position: 'relative',
                          height: 10,
                          borderRadius: 6,
                          background: 'linear-gradient(to right, #16a34a 0%, #16a34a 55%, #d97706 55%, #d97706 75%, #dc2626 75%, #dc2626 100%)',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Needle Marker Indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            left: `${pinPercent}%`,
                            top: -4,
                            transform: 'translateX(-50%)',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#ffffff',
                            border: `3.5px solid ${statusColor}`,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: 'none'
                          }}
                        />
                      </div>

                      {/* Spectrum Zone Labels */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>● Optimal Band</span>
                        <span style={{ color: '#b45309', fontWeight: 600 }}>▲ Warning Limit</span>
                        <span style={{ color: '#b91c1c', fontWeight: 600 }}>■ Escalation Breach</span>
                      </div>
                    </div>

                    {/* Governance Owner & Linked Risk */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                        paddingTop: 12,
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: 11.5
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                        <User size={13} color="var(--text-muted)" />
                        <span>Owner: <strong style={{ color: 'var(--text-primary)' }}>{kri.owner}</strong></span>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: 10.5 }}>
                        {kri.frequency} Sync
                      </span>
                    </div>
                  </div>

                  {/* Interactive Calibration & Sensitivity Simulator */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sliders size={12} />
                        <span>Live Sensitivity Simulator</span>
                      </span>
                      <strong style={{ fontSize: 12, color: statusColor }}>
                        {kri.unit === 'ZMW' ? formatZMW(kri.currentValue) : `${kri.currentValue}${kri.unit}`}
                      </strong>
                    </div>

                    {/* Styled Range Slider */}
                    <input
                      type="range"
                      min={kri.unit === '%' ? (kri.id === 'KRI-04' ? 96 : kri.id === 'KRI-05' ? 1 : 25) : 1000000}
                      max={kri.unit === '%' ? (kri.id === 'KRI-04' ? 100 : kri.id === 'KRI-05' ? 12 : 90) : 7500000}
                      step={kri.unit === '%' ? (kri.id === 'KRI-04' ? 0.05 : 0.2) : 250000}
                      value={kri.currentValue}
                      onChange={e => handleUpdateValue(kri.id, e.target.value)}
                      style={{
                        width: '100%',
                        accentColor: statusColor,
                        height: 6,
                        cursor: 'pointer'
                      }}
                    />

                    {/* Quick Simulation Buttons */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, padding: '3px 6px', fontSize: 10.5 }}
                        onClick={() => handleApplyPreset(kri.id, 'baseline')}
                      >
                        Target Baseline
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5 }}
                        onClick={() => handleApplyPreset(kri.id, 'minus')}
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5 }}
                        onClick={() => handleApplyPreset(kri.id, 'plus')}
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5, color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => handleApplyPreset(kri.id, 'shock')}
                      >
                        Stress Shock
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: KEY CONTROL INDICATORS (KCIs) TABLE (Task 8.7) */}
      {(selectedView === 'kci' || selectedView === 'combined') && (
        <div className="card" style={{ marginTop: selectedView === 'combined' ? 10 : 0 }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="card-title">
                <ShieldCheck size={18} color="#16a34a" />
                <span>Key Control Indicators (KCIs) Operational Health & Testing (Task 8.7)</span>
              </div>
              <div className="card-subtitle">
                Validate operational effectiveness of critical safeguards, verification dual-signoffs, and automated system controls.
              </div>
            </div>
            <span className="badge badge-low">
              4 Critical Internal Controls Monitored
            </span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Control Indicator Code & Name</th>
                  <th>Category</th>
                  <th>Target Benchmark</th>
                  <th>Operational Compliance</th>
                  <th>Verification Test Sample</th>
                  <th>Designated Control Owner</th>
                  <th>Status</th>
                  <th>Last Tested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {kciList.map(kci => {
                  const isEffective = kci.status === 'Effective';
                  const isDeficient = kci.status === 'High Deficiency';

                  return (
                    <tr key={kci.id}>
                      <td style={{ minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span className="risk-code-pill">{kci.code}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                              {kci.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--brand-primary)', marginTop: 2 }}>
                              Linked Rule: {kci.linkedControl}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="badge badge-muted">{kci.category}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{kci.target}</strong>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', minWidth: 150 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar-bg" style={{ flex: 1, height: 7 }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${kci.currentValue}%`,
                                background: isEffective ? '#16a34a' : isDeficient ? '#dc2626' : '#d97706'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: isEffective ? '#16a34a' : isDeficient ? '#dc2626' : '#d97706', width: 44 }}>
                            {kci.currentValue}%
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {kci.testedCount}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {kci.owner}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`badge ${isEffective ? 'badge-low' : isDeficient ? 'badge-critical' : 'badge-high'}`}>
                          {kci.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {kci.lastAssessed}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleTestKCI(kci.id)}
                          title="Simulate Control Verification Test"
                        >
                          <FileCheck size={13} color="var(--brand-primary)" />
                          <span>Verify Test</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
