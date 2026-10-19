import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Network,
  Activity,
  Play,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Code,
  ShieldCheck,
  Building,
  Radio
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export function IntegrationsHub() {
  const { addRisk, showToast, addAuditLog, setNotifications } = useERM();

  const [activeIntegrationTab, setActiveIntegrationTab] = useState('core-insurance'); // 'core-insurance' | 'sanctions' | 'logs'
  const [sanctionsQuery, setSanctionsQuery] = useState('Chambishi Logistics Ltd');
  const [sanctionsResult, setSanctionsResult] = useState(null);
  const [isScreening, setIsScreening] = useState(false);

  // Live API Logs
  const [apiLogs, setApiLogs] = useState([
    {
      id: 'REQ-101',
      endpoint: '/api/v1/integrations/core/claims/webhook',
      method: 'POST',
      status: 200,
      latency: '42ms',
      timestamp: '2026-10-19 14:15:22',
      payload: { claimId: 'CLM-99120', amountZMW: 185000, branch: 'BR-LUS', flag: 'CLEARED' }
    },
    {
      id: 'REQ-102',
      endpoint: '/api/v1/integrations/fic/sanctions/query',
      method: 'GET',
      status: 200,
      latency: '88ms',
      timestamp: '2026-10-19 14:18:05',
      payload: { query: 'Zambezi Mineral Freight Ltd', status: 'PEP_CLEARED' }
    }
  ]);

  // Simulate Inbound Claim Event (Tender Section 9 Demonstration Flow)
  const handleSimulateCoreClaimEvent = () => {
    showToast('Inbound Webhook Received', 'Receiving simulated payload from Core Insurance System...', 'info');

    setTimeout(() => {
      const claimPayload = {
        claimNumber: 'CLM-2026-8891',
        insuredName: 'Lusaka Commercial Haulage Consortium',
        branch: 'BR-LUS',
        amountZMW: 480000,
        incidentType: 'Motor Comprehensive Multiple Vehicle Accident',
        garageName: 'Cairo Auto Panel Beaters',
        riskRuleTrigger: 'RULE-FRAUD-04: Multiple inflated parts claims from same garage within 30 days.'
      };

      const newLog = {
        id: 'REQ-' + Math.floor(Math.random() * 900 + 100),
        endpoint: '/api/v1/integrations/core/claims/webhook',
        method: 'POST',
        status: 201,
        latency: '36ms',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        payload: claimPayload
      };

      setApiLogs(prev => [newLog, ...prev]);

      // Trigger notification
      setNotifications(prev => [
        {
          id: 'ntf-' + Date.now(),
          title: 'Core System Risk Alert',
          message: `Suspicious claim CLM-2026-8891 (ZMW 480K) flagged by Fraud Rule 04 in Lusaka.`,
          time: 'Just now',
          read: false,
          type: 'warning'
        },
        ...prev
      ]);

      addAuditLog('INTEGRATION_EVENT', 'Core Insurance System', 'CLM-2026-8891', 'Received inbound claim event; triggered automated fraud alert');
      showToast('Event Processed & Alerted', 'Claim CLM-2026-8891 validated; Alert dispatched to Risk Manager.', 'warning');
    }, 900);
  };

  // Run PEP / Sanctions screening test
  const handleRunSanctionsCheck = (e) => {
    e.preventDefault();
    if (!sanctionsQuery.trim()) return;

    setIsScreening(true);
    setTimeout(() => {
      setIsScreening(false);
      setSanctionsResult({
        query: sanctionsQuery,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        screeningEngine: 'Financial Intelligence Centre (FIC) + UN Sanctions List',
        status: sanctionsQuery.toLowerCase().includes('fraud') || sanctionsQuery.toLowerCase().includes('sanction') ? 'MATCH_FOUND' : 'CLEAR',
        riskScore: sanctionsQuery.toLowerCase().includes('fraud') ? 85 : 12,
        pepDesignation: 'Non-PEP',
        jurisdiction: 'Zambia / SADC'
      });
      showToast('Sanctions Screen Complete', `Screening finished for "${sanctionsQuery}".`, 'info');
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Integration Hub & Mock API Connectors (Section 9)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Demonstrates real-time interoperability with Core Insurance Systems, CRM, and AML Sanctions Screening engines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Live Mock Gateway Connected</span>
        </div>
      </div>

      {/* Tender Workflow Demonstration Notice */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={16} />
              <span>Simulate Core Insurance System Inbound Claim Event (Section 9 Demo)</span>
            </h3>
            <p style={{ fontSize: 12.5, color: '#1e3a5f', marginTop: 4 }}>
              Click the button to simulate the core system sending an inbound suspicious motor claim event via REST API webhook.
              Watch the ERM system parse payload, trigger fraud rules, update audit logs, and dispatch notifications!
            </p>
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleSimulateCoreClaimEvent}>
            <Play size={16} />
            <span>Simulate Inbound Claim Event</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeIntegrationTab === 'core-insurance' ? 'active' : ''}`}
          onClick={() => setActiveIntegrationTab('core-insurance')}
        >
          <Building size={16} />
          <span>Core Insurance Connectors</span>
        </button>
        <button
          className={`tab-btn ${activeIntegrationTab === 'sanctions' ? 'active' : ''}`}
          onClick={() => setActiveIntegrationTab('sanctions')}
        >
          <ShieldCheck size={16} />
          <span>AML / Sanctions Screening API</span>
        </button>
        <button
          className={`tab-btn ${activeIntegrationTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveIntegrationTab('logs')}
        >
          <Code size={16} />
          <span>API Request & Response Inspector ({apiLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CORE CONNECTORS */}
      {activeIntegrationTab === 'core-insurance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Connector 1 */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Premia / Genius Core Policy System</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Underwriting, Endorsements & Cancellations</span>
              </div>
              <span className="badge badge-low">Connected (Active)</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              Endpoint: <code>https://api.core.apexinsurance.com/v2/policies</code>
              <br />
              Sync Cadence: Hourly Webhook Batch
            </div>
          </div>

          {/* Connector 2 */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Claims Processing Gateway</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Settlements, Loss Adjuster Reports & Invoices</span>
              </div>
              <span className="badge badge-low">Listening (Webhook)</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              Endpoint: <code>/api/v1/integrations/core/claims/webhook</code>
              <br />
              Trigger: Invoices &gt; ZMW 50,000
            </div>
          </div>

          {/* Connector 3 */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Broker Intermediary Portal</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Premium Receivables & Remittances</span>
              </div>
              <span className="badge badge-info">Nightly Sync</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              Endpoint: <code>https://brokers.apexinsurance.com/api/debtors</code>
              <br />
              Overdue Alert Threshold: 60 Days
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANCTIONS SCREENING */}
      {activeIntegrationTab === 'sanctions' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>
            <ShieldCheck size={18} color="#34d399" />
            <span>Interactive FIC / World-Check Sanctions Screening Engine</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Test simulated real-time screening of policyholder and commercial corporate entities against UN, SADC, and Zambian FIC watchlists.
          </p>

          <form onSubmit={handleRunSanctionsCheck} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              className="form-input"
              value={sanctionsQuery}
              onChange={e => setSanctionsQuery(e.target.value)}
              placeholder="Enter corporate or individual name (e.g. Chambishi Logistics Ltd)..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={isScreening}>
              <Search size={15} />
              <span>{isScreening ? 'Querying Watchlists...' : 'Run Screening Check'}</span>
            </button>
          </form>

          {sanctionsResult && (
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 8,
                border: '1px solid var(--border-medium)',
                padding: 18
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Screening Result: {sanctionsResult.query}</span>
                <span className={`badge ${sanctionsResult.status === 'CLEAR' ? 'badge-low' : 'badge-critical'}`}>
                  {sanctionsResult.status === 'CLEAR' ? 'No Sanctions Hit (Clear)' : 'High Risk Match Found'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Authority Database: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{sanctionsResult.screeningEngine}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PEP Status: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{sanctionsResult.pepDesignation}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Assessment Score: </span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{sanctionsResult.riskScore} / 100</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Query Timestamp: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{sanctionsResult.timestamp}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: API LOGS */}
      {activeIntegrationTab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Code size={18} color="var(--brand-primary)" />
              <span>Real-Time Inbound & Outbound Integration Logs</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {apiLogs.map(log => (
              <div
                key={log.id}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{log.method}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{log.endpoint}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>{log.status}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.latency}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.timestamp}</span>
                  </div>
                </div>

                <pre style={{ marginTop: 8, fontSize: 11, color: 'var(--text-primary)', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: 10, borderRadius: 6, overflowX: 'auto' }}>
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
