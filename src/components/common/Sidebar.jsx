import React from 'react';
import { useERM } from '../../context/ERMContext';
import {
  LayoutDashboard,
  ShieldAlert,
  PlusCircle,
  Grid,
  Box,
  TrendingDown,
  ShieldCheck,
  FileSpreadsheet,
  AlertOctagon,
  FileCheck2,
  Gauge,
  Sparkles,
  Network,
  CheckSquare,
  Users,
  ScrollText,
  Sliders,
  Shield,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    risks,
    incidents,
    mitigations,
    aiInsights,
    rcsaSubmissions,
    currentUser,
    logout
  } = useERM();

  const criticalRisksCount = risks.filter(r => r.residualScore >= 16).length;
  const openIncidentsCount = incidents.filter(i => i.status !== 'Closed').length;
  const pendingMitigationsCount = mitigations.filter(m => m.status === 'Open' || m.status === 'In Progress').length;
  const pendingRcsas = rcsaSubmissions.filter(r => r.status === 'Submitted' || r.status === 'Pending').length;

  const navSections = [
    {
      title: 'Core Risk Management',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'risks', label: 'Corporate Risk Register', icon: ShieldAlert, badge: criticalRisksCount ? `${criticalRisksCount} Crit` : null, alert: criticalRisksCount > 0 },
        { id: 'risk-identify', label: 'Risk Identification', icon: PlusCircle },
        { id: 'matrix', label: '5x5 Risk Heatmap Matrix', icon: Grid },
        { id: '3d-landscape', label: '3D Risk Landscape', icon: Box },
        { id: 'stress-test', label: 'Stress Testing & Scenarios', icon: TrendingDown }
      ]
    },
    {
      title: 'Controls & Operations',
      items: [
        { id: 'controls', label: 'Controls & Mitigations', icon: ShieldCheck, badge: pendingMitigationsCount },
        { id: 'rcsa', label: 'Branch RCSA Assessments', icon: FileSpreadsheet, badge: pendingRcsas ? `${pendingRcsas} Due` : null },
        { id: 'incidents', label: 'Incident Management & RCA', icon: AlertOctagon, badge: openIncidentsCount ? `${openIncidentsCount}` : null, alert: openIncidentsCount > 0 }
      ]
    },
    {
      title: 'Governance & Analytics',
      items: [
        { id: 'compliance', label: 'Regulatory & Compliance', icon: FileCheck2 },
        { id: 'kris', label: 'KRI & KCI Monitoring', icon: Gauge },
        { id: 'ai-copilot', label: 'AI Risk Copilot & GenAI', icon: Sparkles, badge: 'AI Live' }
      ]
    },
    {
      title: 'Integration & Workflows',
      items: [
        { id: 'integrations', label: 'Integration Hub (Mock APIs)', icon: Network },
        { id: 'workflows', label: 'Task & Workflow Center', icon: CheckSquare }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', label: 'Users, Roles & Branches', icon: Users },
        { id: 'audit-logs', label: 'Audit Trails & History', icon: ScrollText },
        { id: 'settings', label: 'Methodology & Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-badge-wrapper">
          <div className="brand-logo-icon">
            <Shield size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Apex ERMS</span>
            <span className="brand-sub">General Insurance</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={16} />
                  <span className="nav-label">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`nav-badge ${item.alert ? 'alert' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Session & Sign Out */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="sidebar-logout-btn"
          onClick={logout}
          title="Sign out of current ERMS session"
        >
          <LogOut size={15} />
          <span>Sign Out ({currentUser?.name?.split(' ')[0] || 'User'})</span>
        </button>
      </div>

      {/* Bottom Status Tag */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 11,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>v2.4 Production Demo</span>
        </div>
        <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Tender Ready</span>
      </div>
    </aside>
  );
}
