import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_CONTROLS,
  INITIAL_MITIGATIONS,
  INITIAL_INCIDENTS,
  INITIAL_COMPLIANCE,
  INITIAL_KRIS,
  INITIAL_RCSA_SUBMISSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_AI_INSIGHTS,
  INITIAL_RISKS,
  INITIAL_CONFIG
} from '../data/sampleData';
import { calcInherentRisk, calcResidualRisk, evaluateTolerance } from '../utils/calculations';

const ERMContext = createContext(null);

const STORAGE_KEY_PREFIX = 'apex_erms_';

function getStoredOrInitial(key, initialValue) {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : initialValue;
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}`, err);
    return initialValue;
  }
}

export function ERMProvider({ children }) {
  // State
  const [users, setUsers] = useState(() => getStoredOrInitial('users', INITIAL_USERS));
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'isAuthenticated') === 'true' ||
           sessionStorage.getItem(STORAGE_KEY_PREFIX + 'isAuthenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const isAuth = localStorage.getItem(STORAGE_KEY_PREFIX + 'isAuthenticated') === 'true' ||
                   sessionStorage.getItem(STORAGE_KEY_PREFIX + 'isAuthenticated') === 'true';
    if (!isAuth) return null;
    return getStoredOrInitial('currentUser', INITIAL_USERS[0]);
  });

  const [branches, setBranches] = useState(() => getStoredOrInitial('branches', INITIAL_BRANCHES));
  const [currentBranchFilter, setCurrentBranchFilter] = useState('ALL');

  const [risks, setRisks] = useState(() => getStoredOrInitial('risks', INITIAL_RISKS));
  const [controls, setControls] = useState(() => getStoredOrInitial('controls', INITIAL_CONTROLS));
  const [mitigations, setMitigations] = useState(() => getStoredOrInitial('mitigations', INITIAL_MITIGATIONS));
  const [incidents, setIncidents] = useState(() => getStoredOrInitial('incidents', INITIAL_INCIDENTS));
  const [compliance, setCompliance] = useState(() => getStoredOrInitial('compliance', INITIAL_COMPLIANCE));
  const [kris, setKris] = useState(() => getStoredOrInitial('kris', INITIAL_KRIS));
  const [rcsaSubmissions, setRcsaSubmissions] = useState(() => getStoredOrInitial('rcsa', INITIAL_RCSA_SUBMISSIONS));
  const [auditLogs, setAuditLogs] = useState(() => getStoredOrInitial('auditLogs', INITIAL_AUDIT_LOGS));
  const [aiInsights, setAiInsights] = useState(() => getStoredOrInitial('aiInsights', INITIAL_AI_INSIGHTS));
  const [config, setConfig] = useState(() => getStoredOrInitial('config', INITIAL_CONFIG));

  // Navigation & Drawer
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRiskForDrawer, setSelectedRiskForDrawer] = useState(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'ntf-1',
      title: 'Critical Risk Escalation',
      message: 'RSK-OPS-001 (Claim Fraud) escalated to Board Risk Committee',
      time: '10 mins ago',
      read: false,
      type: 'warning'
    },
    {
      id: 'ntf-2',
      title: 'New RCSA Submission',
      message: 'Grace Lungu submitted Ndola Branch Q3 RCSA assessment',
      time: '2 hours ago',
      read: false,
      type: 'info'
    },
    {
      id: 'ntf-3',
      title: 'AI Anomaly Detected',
      message: 'Surge in motor claim parts invoices flagged in Lusaka',
      time: '1 day ago',
      read: true,
      type: 'ai'
    }
  ]);

  // Persist State Changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'risks', JSON.stringify(risks));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'controls', JSON.stringify(controls));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'mitigations', JSON.stringify(mitigations));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'incidents', JSON.stringify(incidents));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'compliance', JSON.stringify(compliance));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'kris', JSON.stringify(kris));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'rcsa', JSON.stringify(rcsaSubmissions));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'aiInsights', JSON.stringify(aiInsights));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'config', JSON.stringify(config));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(currentUser));
      }
      localStorage.setItem(STORAGE_KEY_PREFIX + 'branches', JSON.stringify(branches));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }, [risks, controls, mitigations, incidents, compliance, kris, rcsaSubmissions, auditLogs, aiInsights, config, currentUser, branches, users]);

  // Helper Toast
  const showToast = (title, message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Helper Audit Logger
  const addAuditLog = (action, entityType, entityId, summary) => {
    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName: currentUser?.name || 'Authorized User',
      actorRole: currentUser?.role || 'Guest',
      action,
      entityType,
      entityId,
      summary,
      ipAddress: '192.168.10.' + Math.floor(Math.random() * 80 + 10)
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Authentication: Login & Logout
  const login = (user, remember = true) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (remember) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'isAuthenticated', 'true');
      localStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(user));
    } else {
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'isAuthenticated', 'true');
      sessionStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(user));
    }

    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'AUTHENTICATION',
      entityId: user.id,
      summary: `User logged in successfully as ${user.role} (${user.department})`,
      ipAddress: '192.168.10.24'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    showToast('Signed In Successfully', `Welcome to Apex ERMS, ${user.name} (${user.role})`, 'success');
  };

  const logout = () => {
    if (currentUser) {
      const newEntry = {
        id: 'AUD-' + Date.now().toString().slice(-4),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'USER_LOGOUT',
        entityType: 'AUTHENTICATION',
        entityId: currentUser.id,
        summary: `User signed out safely from session`,
        ipAddress: '192.168.10.24'
      };
      setAuditLogs(prev => [newEntry, ...prev]);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'isAuthenticated');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUser');
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'isAuthenticated');
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUser');
    setActiveTab('dashboard');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setRisks(INITIAL_RISKS);
    setControls(INITIAL_CONTROLS);
    setMitigations(INITIAL_MITIGATIONS);
    setIncidents(INITIAL_INCIDENTS);
    setCompliance(INITIAL_COMPLIANCE);
    setKris(INITIAL_KRIS);
    setRcsaSubmissions(INITIAL_RCSA_SUBMISSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAiInsights(INITIAL_AI_INSIGHTS);
    setConfig(INITIAL_CONFIG);
    setBranches(INITIAL_BRANCHES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentBranchFilter('ALL');

    showToast('Demo Environment Reset', 'All records, matrices, and workflows restored to initial state.', 'success');
  };

  // Filtered Risks based on branch filter
  const filteredRisks = risks.filter(r => {
    if (currentBranchFilter !== 'ALL' && r.branchId !== currentBranchFilter) return false;
    return true;
  });

  // Risk CRUD Actions
  const addRisk = (riskData) => {
    const l = Number(riskData.inherentLikelihood) || 3;
    const i = Number(riskData.inherentImpact) || 3;
    const { score: inherentScore, level: inherentLevel } = calcInherentRisk(l, i);
    const eff = Number(riskData.controlEffectiveness) || 50;
    const { score: residualScore, level: residualLevel } = calcResidualRisk(inherentScore, eff, config.scoringFormula);
    const tolerance = evaluateTolerance(residualScore, config.riskToleranceThreshold);

    const code = `RSK-${riskData.category.slice(0, 3).toUpperCase()}-${String(risks.length + 1).padStart(3, '0')}`;
    const newRisk = {
      ...riskData,
      id: code,
      code,
      inherentLikelihood: l,
      inherentImpact: i,
      inherentScore,
      inherentLevel,
      controlEffectiveness: eff,
      residualLikelihood: Math.max(1, Math.round(l * (1 - eff / 200))),
      residualImpact: Math.max(1, Math.round(i * (1 - eff / 150))),
      residualScore,
      residualLevel,
      toleranceStatus: tolerance.status,
      status: inherentScore >= config.autoEscalateScore ? 'Escalated' : 'Under Review',
      linkedControlIds: riskData.linkedControlIds || [],
      linkedMitigationIds: [],
      linkedIncidentIds: [],
      linkedComplianceIds: [],
      eventsCount: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      lastAssessed: new Date().toISOString().slice(0, 10),
      history: [{
        date: new Date().toISOString().slice(0, 10),
        inherent: inherentScore,
        residual: residualScore,
        eff,
        user: currentUser.name
      }]
    };

    setRisks(prev => [newRisk, ...prev]);
    addAuditLog('RISK_CREATE', 'Risk', newRisk.code, `Registered risk: ${newRisk.title} (${newRisk.inherentLevel})`);
    showToast('Risk Registered', `Successfully added ${newRisk.code} - ${newRisk.title}`, 'success');

    if (newRisk.status === 'Escalated') {
      setNotifications(prev => [
        {
          id: 'ntf-' + Date.now(),
          title: 'High Severity Escalation',
          message: `${newRisk.code} exceeded auto-escalation threshold (${newRisk.inherentScore}/25).`,
          time: 'Just now',
          read: false,
          type: 'warning'
        },
        ...prev
      ]);
    }

    return newRisk;
  };

  const updateRisk = (id, updates) => {
    setRisks(prev =>
      prev.map(r => {
        if (r.id !== id && r.code !== id) return r;

        const l = updates.inherentLikelihood !== undefined ? Number(updates.inherentLikelihood) : r.inherentLikelihood;
        const i = updates.inherentImpact !== undefined ? Number(updates.inherentImpact) : r.inherentImpact;
        const eff = updates.controlEffectiveness !== undefined ? Number(updates.controlEffectiveness) : r.controlEffectiveness;

        const { score: inherentScore, level: inherentLevel } = calcInherentRisk(l, i);
        const { score: residualScore, level: residualLevel } = calcResidualRisk(inherentScore, eff, config.scoringFormula);
        const tolerance = evaluateTolerance(residualScore, config.riskToleranceThreshold);

        const historyEntry = {
          date: new Date().toISOString().slice(0, 10),
          inherent: inherentScore,
          residual: residualScore,
          eff,
          user: currentUser.name
        };

        const updated = {
          ...r,
          ...updates,
          inherentLikelihood: l,
          inherentImpact: i,
          inherentScore,
          inherentLevel,
          controlEffectiveness: eff,
          residualScore,
          residualLevel,
          toleranceStatus: tolerance.status,
          lastAssessed: new Date().toISOString().slice(0, 10),
          history: [...(r.history || []), historyEntry]
        };

        if (selectedRiskForDrawer?.id === r.id) {
          setSelectedRiskForDrawer(updated);
        }

        return updated;
      })
    );

    addAuditLog('RISK_UPDATE', 'Risk', id, `Updated scoring/details for risk ${id}`);
    showToast('Risk Updated', `Changes to ${id} have been saved and recalculated.`, 'info');
  };

  const deleteRisk = (id) => {
    setRisks(prev => prev.filter(r => r.id !== id && r.code !== id));
    addAuditLog('RISK_DELETE', 'Risk', id, `Deleted risk record ${id}`);
    showToast('Risk Removed', `Risk ${id} deleted from active register.`, 'info');
    if (selectedRiskForDrawer?.id === id) setSelectedRiskForDrawer(null);
  };

  // Controls CRUD
  const addControl = (controlData) => {
    const code = `CTL-${(controlData.category || 'OPS').slice(0, 3).toUpperCase()}-${String(controls.length + 1).padStart(2, '0')}`;
    const newControl = {
      ...controlData,
      id: code,
      code,
      lastTested: new Date().toISOString().slice(0, 10),
      testResult: 'Pass'
    };
    setControls(prev => [newControl, ...prev]);
    addAuditLog('CONTROL_CREATE', 'Control', code, `Created new risk control: ${newControl.title}`);
    showToast('Control Created', `${code} added to centralized control library.`, 'success');
  };

  // Mitigation CRUD
  const addMitigation = (mitigationData) => {
    const code = `MIT-${String(mitigations.length + 1).padStart(3, '0')}`;
    const newPlan = {
      ...mitigationData,
      id: code,
      code,
      progress: 0,
      status: 'Open',
      lastUpdated: new Date().toISOString().slice(0, 10)
    };
    setMitigations(prev => [newPlan, ...prev]);

    // Link to risk
    if (newPlan.riskId) {
      setRisks(prev =>
        prev.map(r => (r.id === newPlan.riskId ? { ...r, linkedMitigationIds: [...(r.linkedMitigationIds || []), code] } : r))
      );
    }

    addAuditLog('MITIGATION_CREATE', 'Mitigation', code, `Created mitigation plan: ${newPlan.title}`);
    showToast('Mitigation Assigned', `${code} assigned to ${newPlan.owner}`, 'success');
  };

  const updateMitigation = (id, updates) => {
    setMitigations(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : m))
    );
    addAuditLog('MITIGATION_UPDATE', 'Mitigation', id, `Updated mitigation progress/status on ${id}`);
    showToast('Mitigation Updated', `Progress recorded for ${id}`, 'info');
  };

  // Incidents CRUD
  const addIncident = (incidentData) => {
    const code = `INC-2026-${String(incidents.length + 1).padStart(3, '0')}`;
    const newIncident = {
      ...incidentData,
      id: code,
      code,
      status: 'Under Investigation',
      reportedDate: new Date().toISOString().slice(0, 10),
      recoveredAmountZMW: 0
    };
    setIncidents(prev => [newIncident, ...prev]);

    // If linked to risk, attach
    if (newIncident.linkedRiskId) {
      setRisks(prev =>
        prev.map(r =>
          r.id === newIncident.linkedRiskId ? { ...r, linkedIncidentIds: [...(r.linkedIncidentIds || []), code], eventsCount: (r.eventsCount || 0) + 1 } : r
        )
      );
    }

    addAuditLog('INCIDENT_REPORT', 'Incident', code, `Incident reported: ${newIncident.title} (${newIncident.severity})`);
    showToast('Incident Registered', `${code} logged and assigned to ${newIncident.assignedTo}`, 'warning');
  };

  // RCSA submission & approval
  const approveRCSA = (id) => {
    setRcsaSubmissions(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'Approved',
              reviewedBy: currentUser.name,
              reviewDate: new Date().toISOString().slice(0, 10)
            }
          : item
      )
    );
    addAuditLog('RCSA_APPROVE', 'RCSA', id, `Approved branch RCSA submission for ${id}`);
    showToast('RCSA Approved', `Branch self-assessment ${id} confirmed into Corporate Register.`, 'success');
  };

  // AI Analysis simulation
  const runAIUniverseScan = () => {
    showToast('AI Analysis in Progress', 'Evaluating risk register, claim anomalies, and underwriting concentrations...', 'info');

    setTimeout(() => {
      const refreshedInsights = [
        ...INITIAL_AI_INSIGHTS,
        {
          id: 'AI-PAT-' + Date.now().toString().slice(-3),
          type: 'Predictive Trend',
          confidence: '93%',
          title: 'Copperbelt Machinery Claim Frequency Correlating with Power Outages',
          severity: 'High',
          source: 'Kitwe Mining Policies & ZESCO Loadshedding Logs',
          date: new Date().toISOString().slice(0, 10),
          summary: 'Machine breakdown claims in Kitwe industrial zone surged 44% during peak voltage fluctuation periods. Recommended installing mandatory surge suppressor inspection controls.',
          recommendation: 'Update mining underwriting endorsements to require surge suppression proof before machinery breakdown cover is validated.',
          status: 'Action Required',
          linkedRiskId: 'RSK-STR-003'
        }
      ];
      setAiInsights(refreshedInsights);
      addAuditLog('AI_UNIVERSE_SCAN', 'AI Engine', 'ALL', 'Executed deep AI pattern and anomaly scan across 120+ risk indicators');
      showToast('AI Scan Completed', 'Grounded risk patterns updated with 1 new anomaly identified.', 'success');
    }, 1200);
  };

  return (
    <ERMContext.Provider
      value={{
        // Authentication & Session
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,

        // Users & Roles
        users,
        setUsers,
        currentUser,
        setCurrentUser,
        branches,
        setBranches,
        currentBranchFilter,
        setCurrentBranchFilter,

        // Core Entities
        risks,
        filteredRisks,
        addRisk,
        updateRisk,
        deleteRisk,

        controls,
        setControls,
        addControl,

        mitigations,
        setMitigations,
        addMitigation,
        updateMitigation,

        incidents,
        setIncidents,
        addIncident,

        compliance,
        setCompliance,

        kris,
        setKris,

        rcsaSubmissions,
        setRcsaSubmissions,
        approveRCSA,

        auditLogs,
        addAuditLog,

        aiInsights,
        runAIUniverseScan,

        config,
        setConfig,

        // Layout & Modals
        activeTab,
        setActiveTab,
        selectedRiskForDrawer,
        setSelectedRiskForDrawer,
        globalSearchOpen,
        setGlobalSearchOpen,

        // Notifications & Toasts
        notifications,
        setNotifications,
        toasts,
        showToast,

        // Reset
        resetDemoData
      }}
    >
      {children}
    </ERMContext.Provider>
  );
}

export function useERM() {
  const context = useContext(ERMContext);
  if (!context) {
    throw new Error('useERM must be used within an ERMProvider');
  }
  return context;
}
