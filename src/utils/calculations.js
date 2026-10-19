/**
 * Enterprise Risk Management System (ERMS) - Scoring Engine & Calculation Utilities
 * Apex General Insurance Limited
 */

export const LIKELIHOOD_LEVELS = [
  { value: 1, label: 'Rare', desc: 'Once in 10+ years (< 5%)' },
  { value: 2, label: 'Unlikely', desc: 'Once in 3-10 years (5-20%)' },
  { value: 3, label: 'Possible', desc: 'Once in 1-3 years (20-50%)' },
  { value: 4, label: 'Likely', desc: 'Multiple times a year (50-80%)' },
  { value: 5, label: 'Almost Certain', desc: 'Frequent recurrence (> 80%)' }
];

export const IMPACT_LEVELS = [
  { value: 1, label: 'Insignificant', desc: '< ZMW 250,000 loss, negligible disruption' },
  { value: 2, label: 'Minor', desc: 'ZMW 250K - 1M loss, minor localized impact' },
  { value: 3, label: 'Moderate', desc: 'ZMW 1M - 5M loss, branch service delays' },
  { value: 4, label: 'Major', desc: 'ZMW 5M - 20M loss, statutory reportable' },
  { value: 5, label: 'Catastrophic', desc: '> ZMW 20M loss, solvency threat, PIA sanction' }
];

export function calcInherentRisk(likelihood, impact) {
  const l = Number(likelihood) || 1;
  const i = Number(impact) || 1;
  const score = l * i;
  let level = 'Low';
  if (score >= 16) level = 'Critical';
  else if (score >= 10) level = 'High';
  else if (score >= 5) level = 'Medium';

  return { score, level };
}

/**
 * Calculates residual risk given inherent score and control effectiveness percentage.
 * Formula options: 'linear' | 'dampened' | 'proportional'
 */
export function calcResidualRisk(inherentScore, controlEffectiveness = 0, formula = 'linear') {
  const eff = Math.min(100, Math.max(0, Number(controlEffectiveness) || 0));
  const score = Number(inherentScore) || 1;

  let residualScore = score;
  if (formula === 'linear') {
    // Tender example: 20 * (1 - 0.6) = 8
    residualScore = Math.round(score * (1 - eff / 100));
  } else if (formula === 'dampened') {
    // Controls cannot eliminate 100% of risk exposure
    residualScore = Math.round(score * (1 - (eff / 100) * 0.75));
  } else {
    residualScore = Math.round(score * (1 - Math.pow(eff / 100, 1.2)));
  }

  residualScore = Math.max(1, Math.min(25, residualScore));

  let level = 'Low';
  if (residualScore >= 16) level = 'Critical';
  else if (residualScore >= 10) level = 'High';
  else if (residualScore >= 5) level = 'Medium';

  return {
    score: residualScore,
    level,
    mitigationPercent: eff,
    scoreReduction: score - residualScore
  };
}

/**
 * Evaluates whether risk breaches corporate tolerance appetite
 */
export function evaluateTolerance(residualScore, threshold = 9) {
  if (residualScore > 15) return { status: 'Critical Breach', breached: true, severity: 'critical' };
  if (residualScore > threshold) return { status: 'Exceeds Threshold', breached: true, severity: 'warning' };
  return { status: 'Within Appetite', breached: false, severity: 'safe' };
}

/**
 * Stress test / Scenario engine that computes simulated impacts across active risk register
 */
export function simulateScenario(risks, scenario) {
  const { likelihoodShift = 0, impactShift = 0, controlDegradation = 0, affectedCategories = [] } = scenario;

  return risks.map(risk => {
    const isAffected = !affectedCategories.length || affectedCategories.includes(risk.category);
    if (!isAffected) return risk;

    const simLikelihood = Math.min(5, Math.max(1, risk.inherentLikelihood + likelihoodShift));
    const simImpact = Math.min(5, Math.max(1, risk.inherentImpact + impactShift));
    const simInherent = simLikelihood * simImpact;
    const simControlEff = Math.max(0, risk.controlEffectiveness - controlDegradation);
    const simResidual = Math.max(1, Math.round(simInherent * (1 - simControlEff / 100)));

    return {
      ...risk,
      originalInherent: risk.inherentScore,
      originalResidual: risk.residualScore,
      simLikelihood,
      simImpact,
      simInherent,
      simControlEff,
      simResidual,
      simExposureZMW: risk.financialExposureZMW * (1 + (impactShift * 0.25))
    };
  });
}
