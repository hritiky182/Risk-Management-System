import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Sparkles,
  AlertTriangle,
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  Copy,
  Printer,
  ShieldCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { formatZMW, formatDate } from '../../utils/formatters';

export function AICopilot() {
  const {
    aiInsights,
    runAIUniverseScan,
    risks,
    incidents,
    compliance,
    kris,
    branches,
    showToast
  } = useERM();

  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'report-gen' | 'chat'

  // Report Generator State
  const [reportScope, setReportScope] = useState('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello. I am the Apex ERMS Grounded Risk Intelligence Copilot. I analyze live records across your 5 branches, 120+ risks, PIA regulatory filings, and loss incidents. Ask me anything about your current risk posture.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Generate Report Handler
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const branchName = reportScope === 'ALL' ? 'Apex General Insurance Consolidated' : branches.find(b => b.id === reportScope)?.name;
      const criticalCount = risks.filter(r => r.residualScore >= 16).length;
      const totalExposure = risks.reduce((acc, r) => acc + (r.financialExposureZMW || 0), 0);

      const reportText = `## Executive Risk & Governance Assessment Report
**Entity:** ${branchName}
**Period:** Q3 2026 Audit & Risk Committee
**Generated:** ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
**Grounded Data References:** 120+ active risk records, 5 branch RCSAs, 4 regulatory frameworks.

---

### 1. Executive Summary & Macro Solvency Posture
Apex General Insurance maintains an aggregate assessed capital exposure of **${formatZMW(totalExposure)}** across all underwriting portfolios. While statutory Solvency Capital Adequacy (CAR) currently stands at a resilient **178.5%** against the Pensions & Insurance Authority (PIA) minimum requirement of 150%, active operational monitoring is recommended due to localized claim volatility.

### 2. Key Grounded Anomaly Observations
1. **Lusaka Private Motor Claims Inflation Spike:**
   - Analysis of incident INC-2026-001 reveals a **38% month-over-month increase** in parts quote discrepancies across 3 panel beaters along Cairo Road.
   - Recommended Action: Enforce dual adjuster signoff and complete deployment of mitigation MIT-001.

2. **Kitwe Heavy Mining Business Interruption Concentration:**
   - Single-event maximum probable loss (MPL) across Chambishi and Mopani copper mining risks (RSK-STR-003) exceeds **ZMW 85,000,000**, approaching treaty retention boundaries.
   - Recommended Action: Expand facultative excess-of-loss capacity with lead international reinsurers.

3. **Intermediary Broker Debtors Aging:**
   - Broker receivables unremitted beyond 60 days currently stand at **ZMW 4,850,000**, triggering an Amber KRI alert.
   - Recommended Action: Enforce automatic policy suspension rule for non-remitted premiums exceeding 45 days.

### 3. Regulatory & Statutory Compliance Health
- **PIA Solvency Supervision:** Fully Compliant.
- **FIC AML/CFT Sanctions Screening:** 84% coverage; PEP screening automation currently active at quote stage.
- **Zambian Data Protection Act No. 3:** Policyholder consent registers updated to 92% completion.

### 4. Strategic Governance Recommendations
- Prioritize board-level review of mining treaty retention ceilings before Q4 reinsurance renewal.
- Authorize immediate digital procurement catalogue verification for Lusaka motor claims unit.`;

      setGeneratedReport(reportText);
      setIsGenerating(false);
      showToast('Executive Report Generated', 'Grounded AI assessment compiled from live database.', 'success');
    }, 1200);
  };

  // Chat Submission Handler
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userQ = chatInput.trim();
    const newHistory = [...chatMessages, { sender: 'user', text: userQ }];
    setChatMessages(newHistory);
    setChatInput('');

    setTimeout(() => {
      let reply = 'Based on live database analysis across Apex records: ';
      const lowerQ = userQ.toLowerCase();

      if (lowerQ.includes('fraud') || lowerQ.includes('lusaka')) {
        reply += 'In the Lusaka branch, Insurance Claim Fraud (RSK-OPS-001) has an Inherent score of 20/25 and Residual score of 8/25 with 60% control effectiveness. Incident INC-2026-001 recently recorded ZMW 320,000 in suspicious parts invoices.';
      } else if (lowerQ.includes('mining') || lowerQ.includes('kitwe')) {
        reply += 'Kitwe branch holds our highest single property exposure in Copperbelt Mining Breakdown (RSK-STR-003) with ZMW 85M exposure and an elevated Residual score of 12/25 (High risk).';
      } else if (lowerQ.includes('pia') || lowerQ.includes('solvency') || lowerQ.includes('compliance')) {
        reply += 'Our current PIA Capital Adequacy Ratio (CAR) is 178.5%, safely exceeding the statutory minimum of 150%. Solvency obligation PIA-RBC-2021 is currently in Compliant status.';
      } else {
        reply += `Currently tracking ${risks.length} registered risks, with ${risks.filter(r => r.residualScore >= 16).length} critical risks and ${compliance.length} statutory compliance obligations across our 5 Zambian branches.`;
      }

      setChatMessages([...newHistory, { sender: 'ai', text: reply }]);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Artificial Intelligence (AI) Risk Copilot & Reporting (Section 13)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Pattern recognition, anomaly detection, policy breach identification, and grounded executive risk reporting.
          </p>
        </div>

        <button className="btn btn-ai" onClick={runAIUniverseScan}>
          <RefreshCw size={14} />
          <span>Scan Risk Universe for Anomalies</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <AlertTriangle size={16} />
          <span>Pattern & Anomaly Findings ({aiInsights.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'report-gen' ? 'active' : ''}`}
          onClick={() => setActiveTab('report-gen')}
        >
          <FileText size={16} />
          <span>Generative AI Executive Report</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          <span>AI Risk Copilot Q&A</span>
        </button>
      </div>

      {/* TAB 1: ANOMALIES & PATTERNS (Section 13.3 & 13.4) */}
      {activeTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {aiInsights.map(insight => (
            <div
              key={insight.id}
              className="card"
              style={{
                borderLeft: `4px solid ${insight.severity === 'Critical' ? '#dc2626' : '#ea580c'}`,
                padding: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-purple">{insight.type}</span>
                    <span className="badge badge-info">Confidence: {insight.confidence}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(insight.date)}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
                    {insight.title}
                  </h3>
                </div>

                <span className={`badge ${insight.severity === 'Critical' ? 'badge-critical' : 'badge-high'}`}>
                  {insight.severity} Priority
                </span>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
                {insight.summary}
              </p>

              <div
                style={{
                  marginTop: 14,
                  padding: '12px 16px',
                  background: 'var(--brand-tint)',
                  borderRadius: 8,
                  border: '1px solid #bfdbfe',
                  fontSize: 12.5
                }}
              >
                <strong style={{ color: 'var(--brand-primary)' }}>AI Recommended Mitigation: </strong>
                <span style={{ color: 'var(--text-secondary)' }}>{insight.recommendation}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Source Grounding: <strong>{insight.source}</strong></span>
                <span>Status: <strong style={{ color: 'var(--brand-primary)' }}>{insight.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: GENERATIVE AI EXECUTIVE REPORT GENERATOR (Section 13.7 & 13.9) */}
      {activeTab === 'report-gen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Sparkles size={18} color="var(--brand-primary)" />
                  <span>Synthesize Executive Risk Briefing (Task 13.7)</span>
                </div>
                <div className="card-subtitle">
                  Generate narrative board reports grounded in live branch data, incident frequencies, and compliance ratios.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  className="form-select"
                  value={reportScope}
                  onChange={e => setReportScope(e.target.value)}
                >
                  <option value="ALL">All Branches (Corporate Apex)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <button
                  className="btn btn-ai"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  <Sparkles size={14} />
                  <span>{isGenerating ? 'Compiling Grounded Analysis...' : 'Generate Executive Report'}</span>
                </button>
              </div>
            </div>

            {/* Generated Report Output Box */}
            {generatedReport && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)' }}>
                    GENERATED REPORT DRAFT (EDITABLE)
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                      <Printer size={13} />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReport);
                        showToast('Copied to Clipboard', 'Report markdown copied.', 'info');
                      }}
                    >
                      <Copy size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <textarea
                  className="form-textarea"
                  rows={16}
                  value={generatedReport}
                  onChange={e => setGeneratedReport(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COPILOT CHAT Q&A */}
      {activeTab === 'chat' && (
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="var(--brand-primary)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
              Grounded Risk Knowledge Assistant
            </span>
            <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>
              Connected to 120+ Risk Records
            </span>
          </div>

          {/* Messages list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: msg.sender === 'user' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  border: msg.sender === 'ai' ? '1px solid var(--border-medium)' : 'none'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '8px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, overflowX: 'auto' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setChatInput('What are the top claim fraud risks in Lusaka?')}
            >
              Lusaka claim fraud?
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setChatInput('Are we compliant with PIA solvency standards?')}
            >
              PIA solvency ratio?
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setChatInput('What is our mining risk concentration in Kitwe?')}
            >
              Kitwe mining risk?
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendChat} style={{ padding: '12px 18px', display: 'flex', gap: 10 }}>
            <input
              type="text"
              className="form-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask about risks, controls, capital exposure, or regulatory filings..."
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
