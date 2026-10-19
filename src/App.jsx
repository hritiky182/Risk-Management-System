import React from 'react';
import { ERMProvider, useERM } from './context/ERMContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { ToastContainer } from './components/common/ToastContainer';
import { RiskDetailDrawer } from './components/risks/RiskDetailDrawer';
import { LoginPage } from './components/auth/LoginPage';

// Module Components
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { RiskHeatmap } from './components/dashboard/RiskHeatmap';
import { RiskRegister } from './components/risks/RiskRegister';
import { RiskIdentification } from './components/risks/RiskIdentification';
import { ThreeDRiskLandscape } from './components/analytics/ThreeDRiskLandscape';
import { ScenarioSimulator } from './components/risks/ScenarioSimulator';
import { ControlManager } from './components/controls/ControlManager';
import { RCSAManager } from './components/rcsa/RCSAManager';
import { IncidentManager } from './components/incidents/IncidentManager';
import { ComplianceManager } from './components/compliance/ComplianceManager';
import { KRIMonitoring } from './components/analytics/KRIMonitoring';
import { AICopilot } from './components/ai/AICopilot';
import { IntegrationsHub } from './components/integrations/IntegrationsHub';
import { WorkflowCenter } from './components/workflows/WorkflowCenter';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { ConfigSettings } from './components/admin/ConfigSettings';

function MainApp() {
  const { isAuthenticated, activeTab } = useERM();

  // STRICT ACCESS CONTROL: No other page or module can be accessed without login
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'risks':
        return <RiskRegister />;
      case 'risk-identify':
        return <RiskIdentification />;
      case 'matrix':
        return <RiskHeatmap />;
      case '3d-landscape':
        return <ThreeDRiskLandscape />;
      case 'stress-test':
        return <ScenarioSimulator />;
      case 'controls':
        return <ControlManager />;
      case 'rcsa':
        return <RCSAManager />;
      case 'incidents':
        return <IncidentManager />;
      case 'compliance':
        return <ComplianceManager />;
      case 'kris':
        return <KRIMonitoring />;
      case 'ai-copilot':
        return <AICopilot />;
      case 'integrations':
        return <IntegrationsHub />;
      case 'workflows':
        return <WorkflowCenter />;
      case 'users':
        return <UserManagement />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'settings':
        return <ConfigSettings />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals & Slideouts */}
      <RiskDetailDrawer />
      <SearchModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ERMProvider>
      <MainApp />
    </ERMProvider>
  );
}
