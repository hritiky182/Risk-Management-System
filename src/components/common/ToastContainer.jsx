import React from 'react';
import { useERM } from '../../context/ERMContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useERM();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let iconColor = '#006ec7';
        let borderColor = '#bae6fd';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = '#16a34a';
          borderColor = '#bbf7d0';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = '#d97706';
          borderColor = '#fde68a';
        } else if (toast.type === 'critical' || toast.type === 'danger') {
          Icon = AlertCircle;
          iconColor = '#dc2626';
          borderColor = '#fecaca';
        }

        return (
          <div
            key={toast.id}
            className="toast"
            style={{ borderLeft: `4px solid ${iconColor}`, borderColor }}
          >
            <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{toast.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{toast.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
