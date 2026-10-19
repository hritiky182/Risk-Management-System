/**
 * Enterprise Risk Management System (ERMS) - Formatters & Utilities
 * Apex General Insurance Limited
 */

export function formatZMW(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'ZMW 0';
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `ZMW ${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `ZMW ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `ZMW ${(amount / 1_000).toFixed(0)}K`;
    }
  }
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    maximumFractionDigits: 0
  }).format(amount).replace('ZMW', 'ZMW ');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })} ${d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } catch {
    return dateStr;
  }
}

export function getRiskLevel(score) {
  if (score >= 16) return { label: 'Critical', class: 'badge-critical', color: '#ef4444' };
  if (score >= 10) return { label: 'High', class: 'badge-high', color: '#f97316' };
  if (score >= 5) return { label: 'Medium', class: 'badge-medium', color: '#eab308' };
  return { label: 'Low', class: 'badge-low', color: '#10b981' };
}

export function getStatusBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'approved':
    case 'compliant':
    case 'effective':
    case 'completed':
    case 'closed':
    case 'within appetite':
      return 'badge-low';

    case 'under review':
    case 'partially compliant':
    case 'partially effective':
    case 'in progress':
    case 'under investigation':
      return 'badge-medium';

    case 'escalated':
    case 'non-compliant':
    case 'ineffective':
    case 'critical breach':
    case 'overdue':
    case 'open':
    case 'exceeds threshold':
      return 'badge-critical';

    case 'submitted':
    case 'pending':
    case 'draft':
    default:
      return 'badge-info';
  }
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
