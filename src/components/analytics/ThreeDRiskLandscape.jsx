import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useERM } from '../../context/ERMContext';
import {
  Box,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Compass,
  Shield,
  AlertTriangle,
  TrendingUp,
  Filter,
  Eye,
  Maximize2,
  ExternalLink,
  X,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatZMW, getRiskLevel } from '../../utils/formatters';

// Helper: Adjust hex color brightness for 3D lighting gradients
function shadeColor(color, percent) {
  let num = parseInt(color.replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// Helper: Convert hex to rgba
function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper: Draw rounded rectangle on canvas
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function ThreeDRiskLandscape() {
  const { filteredRisks, setSelectedRiskForDrawer } = useERM();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const projectedColumnsRef = useRef([]);

  // 3D Camera & View Controls
  const [rotationAngle, setRotationAngle] = useState(45); // Yaw (degrees)
  const [pitchAngle, setPitchAngle] = useState(32);       // Pitch (degrees)
  const [zoom, setZoom] = useState(1.0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Analytical Modes
  const [metricMode, setMetricMode] = useState('residual'); // 'residual' | 'inherent' | 'exposure'
  const [coordMode, setCoordMode] = useState('inherent');   // 'inherent' | 'residual'
  const [labelMode, setLabelMode] = useState('smart');       // 'smart' | 'all' | 'hover'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical-high'

  // Interactivity State
  const [hoveredRisk, setHoveredRisk] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter risks based on active controls
  const visibleRisks = useMemo(() => {
    return (filteredRisks || []).filter(risk => {
      if (categoryFilter !== 'all' && risk.category !== categoryFilter) return false;
      if (severityFilter === 'critical-high' && risk.residualScore < 10) return false;
      return true;
    });
  }, [filteredRisks, categoryFilter, severityFilter]);

  // Camera Presets
  const setPreset = (preset) => {
    switch (preset) {
      case 'iso':
        setRotationAngle(45);
        setPitchAngle(32);
        setZoom(1.0);
        break;
      case 'top':
        setRotationAngle(0);
        setPitchAngle(78);
        setZoom(1.0);
        break;
      case 'front':
        setRotationAngle(0);
        setPitchAngle(18);
        setZoom(1.1);
        break;
      case 'side':
        setRotationAngle(90);
        setPitchAngle(22);
        setZoom(1.1);
        break;
      default:
        break;
    }
  };

  // Auto-rotate tick loop
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    let animId;
    const tick = () => {
      setRotationAngle(prev => (prev + 0.25) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, isDragging]);

  // Main Canvas 3D Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = container.clientWidth || 840;
    const displayHeight = container.clientHeight || 540;

    // Set sharp high-DPI canvas dimensions
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2 + 35;

    const radYaw = (rotationAngle * Math.PI) / 180;
    const radPitch = (pitchAngle * Math.PI) / 180;

    // 3D Isometric Projection
    const project = (x, y, z) => {
      const rotX = x * Math.cos(radYaw) - z * Math.sin(radYaw);
      const rotZ = x * Math.sin(radYaw) + z * Math.cos(radYaw);

      const projX = rotX * zoom + centerX;
      const projY = (y * Math.cos(radPitch) - rotZ * Math.sin(radPitch)) * zoom + centerY;
      return { x: projX, y: projY, depth: rotZ };
    };

    // 5x5 Matrix Grid Dimensions
    const gridSize = 5;
    const cellSize = 62;
    const halfSize = (gridSize * cellSize) / 2;

    // --- 1. Draw 3D Shaded Floor Tiles (5x5 Zones) ---
    for (let r = 1; r <= gridSize; r++) { // Likelihood (Z)
      for (let c = 1; c <= gridSize; c++) { // Impact (X)
        const x0 = -halfSize + (c - 1) * cellSize;
        const x1 = -halfSize + c * cellSize;
        const z0 = -halfSize + (r - 1) * cellSize;
        const z1 = -halfSize + r * cellSize;

        const p1 = project(x0, 0, z0);
        const p2 = project(x1, 0, z0);
        const p3 = project(x1, 0, z1);
        const p4 = project(x0, 0, z1);

        const score = c * r;
        let fillColor = 'rgba(16, 185, 129, 0.08)'; // Low (Green)
        let strokeColor = 'rgba(16, 185, 129, 0.28)';

        if (score >= 16) {
          fillColor = 'rgba(239, 68, 68, 0.14)'; // Critical (Red)
          strokeColor = 'rgba(239, 68, 68, 0.38)';
        } else if (score >= 10) {
          fillColor = 'rgba(249, 115, 22, 0.12)'; // High (Orange)
          strokeColor = 'rgba(249, 115, 22, 0.32)';
        } else if (score >= 5) {
          fillColor = 'rgba(245, 158, 11, 0.09)'; // Medium (Amber)
          strokeColor = 'rgba(245, 158, 11, 0.26)';
        }

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cell score watermark on floor
        const pCenter = project(-halfSize + (c - 0.5) * cellSize, 0, -halfSize + (r - 0.5) * cellSize);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.font = '600 10px JetBrains Mono, monospace';
        ctx.fillText(`${score}`, pCenter.x - 6, pCenter.y + 3);
      }
    }

    // Outer Matrix Border Line
    const o1 = project(-halfSize, 0, -halfSize);
    const o2 = project(halfSize, 0, -halfSize);
    const o3 = project(halfSize, 0, halfSize);
    const o4 = project(-halfSize, 0, halfSize);

    ctx.strokeStyle = 'rgba(0, 110, 199, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(o1.x, o1.y);
    ctx.lineTo(o2.x, o2.y);
    ctx.lineTo(o3.x, o3.y);
    ctx.lineTo(o4.x, o4.y);
    ctx.closePath();
    ctx.stroke();

    // --- 2. Draw 3D Axis Markings & Labels ---
    const impactLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
    const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';

    // Impact Axis (X) markings along edge
    for (let c = 1; c <= gridSize; c++) {
      const posX = -halfSize + (c - 0.5) * cellSize;
      const ptEdge = project(posX, 0, halfSize + 14);
      ctx.fillText(`${c}. ${impactLabels[c - 1]}`, ptEdge.x - 24, ptEdge.y);
    }
    const impactAxisTitle = project(0, 0, halfSize + 36);
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = 'var(--color-primary)';
    ctx.fillText('IMPACT AXIS (1 - 5) →', impactAxisTitle.x - 55, impactAxisTitle.y);

    // Likelihood Axis (Z) markings along edge
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    for (let r = 1; r <= gridSize; r++) {
      const posZ = -halfSize + (r - 0.5) * cellSize;
      const ptEdge = project(-halfSize - 18, 0, posZ);
      ctx.fillText(`${r}. ${likelihoodLabels[r - 1]}`, ptEdge.x - 45, ptEdge.y);
    }
    const likelihoodAxisTitle = project(-halfSize - 42, 0, 0);
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = 'var(--color-primary)';
    ctx.fillText('← LIKELIHOOD AXIS (1 - 5)', likelihoodAxisTitle.x - 70, likelihoodAxisTitle.y);

    // --- 3. Compute 3D Pillars with Constellation Spreading ---
    // Group co-located risks to prevent overlapping cylinders
    const cellGroups = {};
    visibleRisks.forEach(risk => {
      const i = coordMode === 'residual' ? (risk.residualImpact || 3) : (risk.inherentImpact || 4);
      const l = coordMode === 'residual' ? (risk.residualLikelihood || 2) : (risk.inherentLikelihood || 4);
      const key = `${i}_${l}`;
      if (!cellGroups[key]) cellGroups[key] = [];
      cellGroups[key].push(risk);
    });

    const columns = [];
    Object.keys(cellGroups).forEach(key => {
      const [iStr, lStr] = key.split('_');
      const i = parseInt(iStr, 10);
      const l = parseInt(lStr, 10);
      const group = cellGroups[key];
      const count = group.length;

      group.forEach((risk, idx) => {
        let offsetX = 0;
        let offsetZ = 0;

        if (count > 1) {
          const radius = Math.min(cellSize * 0.28, 10 + count * 2.8);
          const angle = (2 * Math.PI * idx) / count + 0.35;
          offsetX = radius * Math.cos(angle);
          offsetZ = radius * Math.sin(angle);
        }

        const posX = -halfSize + (i - 0.5) * cellSize + offsetX;
        const posZ = -halfSize + (l - 0.5) * cellSize + offsetZ;

        // Elevation scale
        let val = 10;
        if (metricMode === 'residual') {
          val = risk.residualScore || 8;
        } else if (metricMode === 'inherent') {
          val = risk.inherentScore || 16;
        } else {
          // Financial exposure scaled between 5 and 25
          const exposure = risk.financialExposureZMW || 10_000_000;
          val = Math.min(25, Math.max(5, (exposure / 85_000_000) * 25));
        }

        const colHeight = -val * 7.5; // Negative Y extends upwards in 3D projection

        // Color coding by score
        const score = metricMode === 'inherent' ? risk.inherentScore : risk.residualScore;
        let color = '#10b981'; // Low
        if (score >= 16) color = '#ef4444';      // Critical
        else if (score >= 10) color = '#f97316'; // High
        else if (score >= 5) color = '#f59e0b';  // Medium

        const base = project(posX, 0, posZ);
        const top = project(posX, colHeight, posZ);

        columns.push({
          risk,
          base,
          top,
          color,
          depth: base.depth,
          colHeight,
          posX,
          posZ,
          score,
          isHovered: hoveredRisk?.id === risk.id,
          isSelected: selectedRisk?.id === risk.id
        });
      });
    });

    // Save projected columns for mouse hit-testing
    projectedColumnsRef.current = columns;

    // Depth sorting for Painter's algorithm
    columns.sort((a, b) => b.depth - a.depth);

    // --- 4. Render 3D Pillars ---
    columns.forEach(col => {
      let colWidth = Math.max(12, 16 * zoom);
      if (col.isHovered || col.isSelected) colWidth *= 1.25;

      // Ground Contact Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(col.base.x + 2, col.base.y + 1, (colWidth / 2) * 1.15, (colWidth / 3.4) * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vertical Upward Glowing Beacon if Hovered or Selected
      if (col.isHovered || col.isSelected) {
        // Beacon beam fading into the sky
        const beaconGrad = ctx.createLinearGradient(col.top.x, col.top.y, col.top.x, col.top.y - 70);
        beaconGrad.addColorStop(0, hexToRgba(col.color, 0.45));
        beaconGrad.addColorStop(1, hexToRgba(col.color, 0.0));
        ctx.fillStyle = beaconGrad;
        ctx.beginPath();
        ctx.moveTo(col.top.x - colWidth / 2, col.top.y);
        ctx.lineTo(col.top.x - colWidth * 1.5, col.top.y - 70);
        ctx.lineTo(col.top.x + colWidth * 1.5, col.top.y - 70);
        ctx.lineTo(col.top.x + colWidth / 2, col.top.y);
        ctx.closePath();
        ctx.fill();

        // Pulsing halo ring around top cap
        ctx.strokeStyle = hexToRgba(col.color, 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(col.top.x, col.top.y, (colWidth / 2) * 1.5, (colWidth / 3.4) * 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Ground plumb line
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(0, 110, 199, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(col.top.x, col.top.y);
        ctx.lineTo(col.base.x, col.base.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cylinder Side Body with directional lighting
      const leftX = col.top.x - colWidth / 2;
      const rightX = col.top.x + colWidth / 2;
      const baseLeftX = col.base.x - colWidth / 2;
      const baseRightX = col.base.x + colWidth / 2;

      const grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      grad.addColorStop(0, shadeColor(col.color, -25));
      grad.addColorStop(0.3, shadeColor(col.color, 25));
      grad.addColorStop(0.75, col.color);
      grad.addColorStop(1, shadeColor(col.color, -35));

      ctx.fillStyle = grad;
      ctx.globalAlpha = col.isHovered || col.isSelected ? 1.0 : 0.88;
      ctx.beginPath();
      ctx.moveTo(baseLeftX, col.base.y);
      ctx.lineTo(leftX, col.top.y);
      ctx.lineTo(rightX, col.top.y);
      ctx.lineTo(baseRightX, col.base.y);
      ctx.closePath();
      ctx.fill();

      // Volumetric Metrology Elevation Rings
      const ringCount = 3;
      for (let r = 1; r <= ringCount; r++) {
        const t = r / (ringCount + 1);
        const ringY = col.base.y + (col.top.y - col.base.y) * t;
        const ringX = col.base.x + (col.top.x - col.base.x) * t;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(ringX, ringY, colWidth / 2, colWidth / 4, 0, 0, Math.PI);
        ctx.stroke();
      }

      // Cylinder Top Cap Disc
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = shadeColor(col.color, col.isHovered ? 30 : 15);
      ctx.beginPath();
      ctx.ellipse(col.top.x, col.top.y, colWidth / 2, colWidth / 3.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular Top Rim
      ctx.strokeStyle = col.isHovered || col.isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = col.isHovered || col.isSelected ? 2 : 1;
      ctx.stroke();
    });

    // --- 5. Smart Anti-Collision Floating Callout Badges ---
    // Solves the overlapping text bug completely
    const displayedBadgeRects = [];

    columns.forEach(col => {
      const isCritical = col.score >= 16;
      const shouldShow =
        col.isHovered ||
        col.isSelected ||
        (labelMode === 'all') ||
        (labelMode === 'smart' && isCritical);

      if (!shouldShow) return;

      const scoreLabel = metricMode === 'residual'
        ? `R:${col.risk.residualScore}`
        : metricMode === 'inherent'
        ? `I:${col.risk.inherentScore}`
        : formatZMW(col.risk.financialExposureZMW, true);

      const labelText = `${col.risk.code} · ${scoreLabel}`;
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      const textWidth = ctx.measureText(labelText).width;
      const badgeW = textWidth + 14;
      const badgeH = 20;
      const colWidth = Math.max(12, 16 * zoom);

      const badgeX = col.top.x - badgeW / 2;
      const badgeY = col.top.y - (colWidth / 3.4) - badgeH - 10;

      // Anti-collision check: skip if overlapping with an existing badge unless hovered
      if (!col.isHovered && !col.isSelected) {
        const hasCollision = displayedBadgeRects.some(rect => {
          const dx = Math.abs(rect.x - badgeX);
          const dy = Math.abs(rect.y - badgeY);
          return dx < (badgeW + 10) && dy < (badgeH + 8);
        });
        if (hasCollision) return; // Suppress overlapping badge cleanly
      }

      displayedBadgeRects.push({ x: badgeX, y: badgeY });

      // Connector pin pointer line from pillar cap to badge
      ctx.strokeStyle = col.isHovered ? 'var(--color-primary)' : col.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(col.top.x, col.top.y - (colWidth / 3.4));
      ctx.lineTo(col.top.x, badgeY + badgeH);
      ctx.stroke();

      // Badge Container Pill
      ctx.fillStyle = col.isHovered ? '#0f172a' : '#ffffff';
      ctx.strokeStyle = col.isHovered ? '#38bdf8' : col.color;
      ctx.lineWidth = col.isHovered ? 1.8 : 1.2;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
      ctx.shadowBlur = 6;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 5);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Badge Text
      ctx.fillStyle = col.isHovered ? '#ffffff' : '#0f172a';
      ctx.fillText(labelText, badgeX + 7, badgeY + 14);
    });

    ctx.restore();
  }, [
    visibleRisks,
    rotationAngle,
    pitchAngle,
    zoom,
    metricMode,
    coordMode,
    labelMode,
    hoveredRisk,
    selectedRisk
  ]);

  // Mouse Orbit Drag & Hit-Testing Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setRotationAngle(prev => (prev + dx * 0.45 + 360) % 360);
      setPitchAngle(prev => Math.min(80, Math.max(10, prev - dy * 0.45)));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Hit-testing pillars (reverse order to prioritize closer depth)
    const columns = [...projectedColumnsRef.current].reverse();
    let hitRisk = null;

    for (const col of columns) {
      const colWidth = Math.max(16, 20 * zoom);
      const dx = mouseX - col.top.x;
      const minY = Math.min(col.top.y, col.base.y) - 15;
      const maxY = Math.max(col.top.y, col.base.y) + 15;

      if (Math.abs(dx) <= colWidth / 1.5 && mouseY >= minY && mouseY <= maxY) {
        hitRisk = col.risk;
        break;
      }
    }

    setHoveredRisk(hitRisk);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredRisk) {
      setSelectedRisk(hoveredRisk);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(z => Math.min(2.0, Math.max(0.6, z + delta)));
  };

  // Top metric stats for summary footer
  const highestResidualRisk = useMemo(() => {
    return [...visibleRisks].sort((a, b) => b.residualScore - a.residualScore)[0] || null;
  }, [visibleRisks]);

  const highestExposureRisk = useMemo(() => {
    return [...visibleRisks].sort((a, b) => b.financialExposureZMW - a.financialExposureZMW)[0] || null;
  }, [visibleRisks]);

  return (
    <div className="card">
      {/* 1. Header Bar */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="card-title">
            <Box size={20} color="var(--color-primary)" />
            <span>Interactive 3D Risk Landscape Visualizer (Tender Section VI - Task 8.11)</span>
            <span className="badge badge-info" style={{ marginLeft: 6 }}>
              {visibleRisks.length} Pillars Plotted
            </span>
          </div>
          <div className="card-subtitle">
            Dynamic three-dimensional risk topography elevation. Taller volumetric pillars represent higher severity clusters.
          </div>
        </div>

        {/* View Camera Presets & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPreset('iso')}
              title="Isometric 45° Angle"
              style={{ fontSize: 11 }}
            >
              Isometric
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPreset('top')}
              title="Top-Down Matrix Heatmap"
              style={{ fontSize: 11 }}
            >
              Top-Down
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPreset('front')}
              title="Front Elevation"
              style={{ fontSize: 11 }}
            >
              Front
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPreset('side')}
              title="Side Profile"
              style={{ fontSize: 11 }}
            >
              Side
            </button>
          </div>

          <button
            className={`btn btn-sm ${autoRotate ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAutoRotate(r => !r)}
            title={autoRotate ? 'Pause 3D Auto-Rotation' : 'Start 3D Auto-Rotation'}
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            <span style={{ marginLeft: 4 }}>{autoRotate ? 'Rotating' : 'Auto-Rotate'}</span>
          </button>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="header-icon-btn"
              onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="header-icon-btn"
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              className="header-icon-btn"
              onClick={() => setPreset('iso')}
              title="Reset View"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="canvas-3d-toolbar">
        {/* Row 1: Elevation Metric Mode & Coordinate Space */}
        <div className="canvas-3d-toolbar-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Elevation Height:
            </span>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <button
                className={`btn btn-sm ${metricMode === 'residual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMetricMode('residual')}
              >
                Residual Score
              </button>
              <button
                className={`btn btn-sm ${metricMode === 'inherent' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMetricMode('inherent')}
              >
                Inherent Score
              </button>
              <button
                className={`btn btn-sm ${metricMode === 'exposure' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMetricMode('exposure')}
              >
                Financial Exposure (ZMW)
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Matrix Position:
            </span>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <button
                className={`btn btn-sm ${coordMode === 'inherent' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCoordMode('inherent')}
                title="Plot at Inherent Likelihood & Impact coordinates"
              >
                Inherent (Initial)
              </button>
              <button
                className={`btn btn-sm ${coordMode === 'residual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCoordMode('residual')}
                title="Plot at Mitigated Residual Likelihood & Impact coordinates"
              >
                Residual (Post-Control)
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter & Label Decluttering Mode */}
        <div className="canvas-3d-toolbar-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Filter Domain:
            </span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['all', 'Strategic', 'Financial', 'Operational', 'Cyber/Tech'].map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategoryFilter(cat)}
                  style={{ fontSize: 11 }}
                >
                  {cat === 'all' ? 'All Domains' : cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Callout Badges:
            </span>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <button
                className={`btn btn-sm ${labelMode === 'smart' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLabelMode('smart')}
                title="Clean view: only Critical risks and Hovered risk shown"
              >
                Smart (De-cluttered)
              </button>
              <button
                className={`btn btn-sm ${labelMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLabelMode('all')}
                title="Show labels for all risks"
              >
                Show All
              </button>
              <button
                className={`btn btn-sm ${labelMode === 'hover' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLabelMode('hover')}
                title="Cinematic view: labels appear on hover only"
              >
                Hover Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive 3D Canvas Viewport */}
      <div
        ref={containerRef}
        className="canvas-3d-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? 'grabbing' : hoveredRisk ? 'pointer' : 'grab'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Top-Right Risk Severity Bands Legend */}
        <div
          className="landscape-hud-badge"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            Risk Severity Spectrum
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
            <span>Critical (16 - 25)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f97316' }} />
            <span>High (10 - 15)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
            <span>Medium (5 - 9)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981' }} />
            <span>Low (1 - 4)</span>
          </div>
        </div>

        {/* Bottom-Left Telemetry & Interaction HUD */}
        <div
          className="landscape-hud-badge"
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={13} color="var(--color-primary)" />
            <span>
              Projection: <strong>{Math.round(rotationAngle)}° Yaw / {Math.round(pitchAngle)}° Pitch ({zoom.toFixed(1)}x)</strong>
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 10 }}>
            Tip: <strong>Click & Drag</strong> to orbit · <strong>Scroll</strong> to zoom · <strong>Click pillar</strong> to inspect
          </div>
        </div>

        {/* Floating Interactive Risk Inspector Card (Bottom-Right) */}
        {(selectedRisk || hoveredRisk) && (
          <div className="landscape-inspector-card">
            {(() => {
              const active = selectedRisk || hoveredRisk;
              const level = getRiskLevel(active.residualScore);
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="risk-code-pill">{active.code}</span>
                      <span className={`badge ${level.class}`}>
                        {level.label} ({active.residualScore})
                      </span>
                    </div>
                    {selectedRisk && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRisk(null);
                        }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
                    {active.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {active.branchName || 'Lusaka HQ'} · {active.category}
                  </div>

                  {/* 3-Column Quick Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--bg-subtle)', padding: 8, borderRadius: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Inherent</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#dc2626' }}>{active.inherentScore}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Residual</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-primary)' }}>{active.residualScore}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Exposure</div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-primary)' }}>
                        {formatZMW(active.financialExposureZMW, true)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                      Tolerance: <strong style={{ color: active.toleranceStatus === 'Critical Breach' ? '#dc2626' : 'var(--text-primary)' }}>{active.toleranceStatus}</strong>
                    </span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRiskForDrawer(active);
                      }}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      <span>Full Details</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 4. Executive Analytical Summary Strip */}
      <div className="landscape-summary-grid">
        <div className="landscape-summary-card">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Peak Severity Elevation
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {highestResidualRisk ? `${highestResidualRisk.code} (Score ${highestResidualRisk.residualScore})` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {highestResidualRisk?.title?.slice(0, 32)}...
            </div>
          </div>
        </div>

        <div className="landscape-summary-card">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0, 110, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Maximum Financial Exposure
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {highestExposureRisk ? formatZMW(highestExposureRisk.financialExposureZMW) : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Lead risk: {highestExposureRisk?.code}
            </div>
          </div>
        </div>

        <div className="landscape-summary-card">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Mitigation Migration Delta
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
              -42.5% Score Reduction
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Inherent Avg: 18.4 → Residual Avg: 10.6
            </div>
          </div>
        </div>

        <div className="landscape-summary-card">
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Layers size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Matrix Density Cluster
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              Zone L4 × I5 (4 Risks)
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Concentrated in Lusaka & Kitwe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
