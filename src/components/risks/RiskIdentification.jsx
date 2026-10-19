import React, { useState } from 'react';
import { useERM } from '../../context/ERMContext';
import { PlusCircle, Sparkles, CheckCircle2, ArrowRight, ShieldAlert, Sliders } from 'lucide-react';
import { calcInherentRisk, calcResidualRisk } from '../../utils/calculations';

export function RiskIdentification() {
  const { addRisk, branches, users, controls, setActiveTab, setSelectedRiskForDrawer } = useERM();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Operational');
  const [subcategory, setSubcategory] = useState('Fraud & Claims Leakage');
  const [source, setSource] = useState('Internal / Staff Collusion');
  const [branchId, setBranchId] = useState('BR-LUS');
  const [owner, setOwner] = useState('Sipho Phiri (Branch Manager)');
  const [department, setDepartment] = useState('Motor Claims & Adjustments');
  const [inherentLikelihood, setInherentLikelihood] = useState(4);
  const [inherentImpact, setInherentImpact] = useState(5);
  const [controlEffectiveness, setControlEffectiveness] = useState(60);
  const [financialExposureZMW, setFinancialExposureZMW] = useState(12500000);
  const [linkedControls, setLinkedControls] = useState(['CTL-OPS-01', 'CTL-OPS-02']);

  // Dynamic taxonomy subcategories based on category
  const subcategoryMap = {
    Operational: ['Fraud & Claims Leakage', 'IT Systems & Infrastructure', 'Underwriting Execution', 'Cash & Branch Operations'],
    Financial: ['Credit & Premium Default', 'Reinsurance Recovery', 'Foreign Exchange Volatility', 'Asset-Liability Mismatch'],
    Compliance: ['PIA Regulatory Standards', 'AML/CFT & Sanctions', 'Zambian Data Protection', 'Tax & ZRA Withholding'],
    Strategic: ['Mining Property & Business Interruption', 'Climate & Agro-Drought', 'Market Competition', 'Product Underwriting Strategy'],
    'Cyber/Tech': ['Ransomware & Threat Actors', 'Core Legacy System Latency', 'Cloud Infrastructure Availability', 'Data Breach'],
    Reputational: ['Social Media & Brand Risk', 'Claims Settlement Turnaround Publicity', 'Regulatory Enforcement Notice']
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    setSubcategory(subcategoryMap[newCat]?.[0] || 'General');
  };

  // Load Lusaka Claim Fraud Tender Demo Example (Section 2 Example Demo)
  const handleLoadTenderExample = () => {
    setTitle('Insurance Claim Fraud & Inflated Panel Beater Invoicing');
    setDescription('High frequency of fabricated motor claim estimates colluded between commercial vehicle owners and unregistered Lusaka garages.');
    setCategory('Operational');
    setSubcategory('Fraud & Claims Leakage');
    setSource('Internal / External Collusion');
    setBranchId('BR-LUS');
    setOwner('Branch Manager (Sipho Phiri)');
    setDepartment('Motor Claims & Adjustments');
    setInherentLikelihood(4);
    setInherentImpact(5);
    setControlEffectiveness(60);
    setFinancialExposureZMW(12500000);
    setLinkedControls(['CTL-OPS-01', 'CTL-OPS-02']);
  };

  const { score: previewInherentScore, level: previewInherentLevel } = calcInherentRisk(inherentLikelihood, inherentImpact);
  const { score: previewResidualScore, level: previewResidualLevel } = calcResidualRisk(previewInherentScore, controlEffectiveness);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const branchObj = branches.find(b => b.id === branchId);

    const createdRisk = addRisk({
      title,
      description,
      category,
      subcategory,
      source,
      branchId,
      branchName: branchObj ? branchObj.name : 'Lusaka Head Office',
      owner,
      department,
      inherentLikelihood,
      inherentImpact,
      controlEffectiveness,
      financialExposureZMW: Number(financialExposureZMW) || 1000000,
      linkedControlIds: linkedControls
    });

    // Jump to the drawer or register
    setSelectedRiskForDrawer(createdRisk);
    setActiveTab('risks');
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <PlusCircle size={20} color="var(--brand-secondary)" />
              <span>Register New Business Risk (Section 2: Tasks 2.1 - 2.8)</span>
            </div>
            <div className="card-subtitle">
              Classify risks by taxonomy, ownership, operational sources, and likelihood × impact scoring.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ai btn-sm"
            onClick={handleLoadTenderExample}
            title="Pre-populate the Tender Section 2 Demonstration Case"
          >
            <Sparkles size={14} />
            <span>Load Tender Lusaka Demo Case</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Risk Title */}
          <div className="form-group">
            <label className="form-label">
              Risk Statement / Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Insurance Claim Fraud in Lusaka Private Motor Portfolio"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Risk Description & Cause Analysis</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what could happen, the root causes, and potential consequences for the enterprise..."
            />
          </div>

          {/* Taxonomy Row: Category, Subcategory, Source */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Risk Category (Task 2.1)</label>
              <select className="form-select" value={category} onChange={handleCategoryChange}>
                <option value="Operational">Operational Risk</option>
                <option value="Financial">Financial & Market Risk</option>
                <option value="Compliance">Compliance & Regulatory</option>
                <option value="Strategic">Strategic & Underwriting</option>
                <option value="Cyber/Tech">Cyber & Technology</option>
                <option value="Reputational">Reputational Risk</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Taxonomy Subcategory (Task 2.2)</label>
              <select className="form-select" value={subcategory} onChange={e => setSubcategory(e.target.value)}>
                {(subcategoryMap[category] || []).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Risk Source (Task 2.4)</label>
              <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                <option value="Internal / External Collusion">Internal / External Collusion</option>
                <option value="Internal Process / Human Error">Internal Process / Human Error</option>
                <option value="External Market / Competitor">External Market / Competitor</option>
                <option value="Regulatory / Statutory Mandate">Regulatory / Statutory Mandate</option>
                <option value="Macroeconomic / Foreign Exchange">Macroeconomic / Foreign Exchange</option>
                <option value="Climate / Natural Catastrophe">Climate / Natural Catastrophe</option>
              </select>
            </div>
          </div>

          {/* Branch, Owner, Exposure */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Assigned Branch (Task 2.5)</label>
              <select className="form-select" value={branchId} onChange={e => setBranchId(e.target.value)}>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.region})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designated Risk Owner</label>
              <input
                type="text"
                className="form-input"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="e.g. Sipho Phiri (Branch Manager)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Financial Exposure (ZMW)</label>
              <input
                type="number"
                className="form-input"
                value={financialExposureZMW}
                onChange={e => setFinancialExposureZMW(e.target.value)}
                placeholder="e.g. 12500000"
              />
            </div>
          </div>

          {/* Initial Scoring Engine Inputs (Section 3) */}
          <div
            style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: 18
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={16} color="var(--brand-primary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>
                  Initial Risk Assessment & Scoring Matrix (Section 3: Likelihood × Impact)
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <span className={`badge ${previewInherentScore >= 16 ? 'badge-critical' : previewInherentScore >= 10 ? 'badge-high' : 'badge-medium'}`}>
                  Inherent: {previewInherentLevel} ({previewInherentScore}/25)
                </span>
                <span className={`badge ${previewResidualScore >= 16 ? 'badge-critical' : previewResidualScore >= 10 ? 'badge-high' : 'badge-low'}`}>
                  Residual: {previewResidualLevel} ({previewResidualScore}/25)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Likelihood */}
              <div>
                <label className="form-label">Likelihood: {inherentLikelihood} / 5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={inherentLikelihood}
                  onChange={e => setInherentLikelihood(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {['1 - Rare (< 5%)', '2 - Unlikely (5-20%)', '3 - Possible (20-50%)', '4 - Likely (50-80%)', '5 - Almost Certain (> 80%)'][inherentLikelihood - 1]}
                </div>
              </div>

              {/* Impact */}
              <div>
                <label className="form-label">Impact: {inherentImpact} / 5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={inherentImpact}
                  onChange={e => setInherentImpact(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f97316' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {['1 - Insignificant (< 250K)', '2 - Minor (250K-1M)', '3 - Moderate (1M-5M)', '4 - Major (5M-20M)', '5 - Catastrophic (> 20M)'][inherentImpact - 1]}
                </div>
              </div>

              {/* Control Effectiveness */}
              <div>
                <label className="form-label">Existing Control Effectiveness: {controlEffectiveness}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={controlEffectiveness}
                  onChange={e => setControlEffectiveness(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Reduces inherent risk by {controlEffectiveness}%
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('risks')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              <CheckCircle2 size={16} />
              <span>Submit & Register Risk</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
