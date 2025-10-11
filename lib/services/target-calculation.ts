/**
 * Auto Target Calculation Service
 *
 * Calculates target values based on partner's baseline and indicator calculation rules
 * Based on PRD: 5 Performance Indicators with specific calculation logic
 */

interface CalculationRule {
  condition: string
  target_increase?: number | string
  target_decrease?: number | string
  description_km: string
  description_en?: string
}

interface Indicator {
  indicator_code: string
  indicator_number: number
  target_percentage: number
  baseline_percentage: number
  is_reduction_target: boolean
  calculation_rules: CalculationRule[]
}

export interface TargetCalculationInput {
  indicator: Indicator
  partner_baseline: number
}

export interface TargetCalculationResult {
  calculated_target: number
  rule_applied: CalculationRule
  calculation_explanation_km: string
  calculation_explanation_en: string
  is_auto_calculated: boolean
}

/**
 * Calculate target based on partner's baseline and indicator rules
 */
export function calculateTarget(input: TargetCalculationInput): TargetCalculationResult {
  const { indicator, partner_baseline } = input
  const { calculation_rules, baseline_percentage, target_percentage, is_reduction_target } = indicator

  // Find the matching rule
  for (const rule of calculation_rules) {
    if (evaluateCondition(rule.condition, partner_baseline, baseline_percentage)) {
      const calculated_target = applyRule(
        rule,
        partner_baseline,
        baseline_percentage,
        target_percentage,
        is_reduction_target
      )

      return {
        calculated_target,
        rule_applied: rule,
        calculation_explanation_km: generateExplanation(
          partner_baseline,
          calculated_target,
          rule,
          true
        ),
        calculation_explanation_en: generateExplanation(
          partner_baseline,
          calculated_target,
          rule,
          false
        ),
        is_auto_calculated: true
      }
    }
  }

  // Fallback: no rule matched, use standard target
  const fallbackRule = calculation_rules[1] // Usually the "equal" condition
  return {
    calculated_target: target_percentage,
    rule_applied: fallbackRule,
    calculation_explanation_km: `ប្រើគោលដៅស្តង់ដារ: ${target_percentage}%`,
    calculation_explanation_en: `Using standard target: ${target_percentage}%`,
    is_auto_calculated: true
  }
}

/**
 * Evaluate condition string against baseline values
 */
function evaluateCondition(
  condition: string,
  partner_baseline: number,
  standard_baseline: number
): boolean {
  // Parse condition like "baseline < 93.7" or "baseline >= 95"
  if (condition.includes('<') && !condition.includes('=')) {
    return partner_baseline < standard_baseline
  } else if (condition.includes('<=')) {
    return partner_baseline <= standard_baseline
  } else if (condition.includes('>') && !condition.includes('=')) {
    return partner_baseline > standard_baseline
  } else if (condition.includes('>=')) {
    return partner_baseline >= standard_baseline
  } else if (condition.includes('==')) {
    return Math.abs(partner_baseline - standard_baseline) < 0.01 // Float comparison
  }
  return false
}

/**
 * Apply the calculation rule to get target value
 */
function applyRule(
  rule: CalculationRule,
  partner_baseline: number,
  standard_baseline: number,
  standard_target: number,
  is_reduction_target: boolean
): number {
  // Handle increase indicators
  if (rule.target_increase !== undefined) {
    if (typeof rule.target_increase === 'number') {
      if (rule.target_increase === 0) {
        return partner_baseline // Maintain current level
      }
      return partner_baseline + rule.target_increase
    } else if (rule.target_increase === 'up_to_' + standard_target) {
      return standard_target
    } else if (rule.target_increase.toString().startsWith('up_to_')) {
      const targetValue = parseFloat(rule.target_increase.toString().replace('up_to_', ''))
      return targetValue
    }
  }

  // Handle reduction indicators
  if (rule.target_decrease !== undefined) {
    if (typeof rule.target_decrease === 'number') {
      if (rule.target_decrease === 0) {
        return partner_baseline // Maintain current level
      }
      return partner_baseline - rule.target_decrease
    } else if (rule.target_decrease === 'down_to_' + standard_target) {
      return standard_target
    } else if (rule.target_decrease.toString().startsWith('down_to_')) {
      const targetValue = parseFloat(rule.target_decrease.toString().replace('down_to_', ''))
      return targetValue
    }
  }

  // Default: return standard target
  return standard_target
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  baseline: number,
  target: number,
  rule: CalculationRule,
  is_khmer: boolean
): string {
  const diff = Math.abs(target - baseline)
  const direction = target > baseline ? 'increase' : target < baseline ? 'decrease' : 'maintain'

  if (is_khmer) {
    if (direction === 'increase') {
      return `ទិន្នន័យមូលដ្ឋាន ${baseline}% ត្រូវបង្កើនដល់ ${target}% (+${diff.toFixed(1)}%)`
    } else if (direction === 'decrease') {
      return `ទិន្នន័យមូលដ្ឋាន ${baseline}% ត្រូវបន្ថយមក ${target}% (-${diff.toFixed(1)}%)`
    } else {
      return `ទិន្នន័យមូលដ្ឋាន ${baseline}% ត្រូវរក្សានៅ ${target}%`
    }
  } else {
    if (direction === 'increase') {
      return `Baseline ${baseline}% should increase to ${target}% (+${diff.toFixed(1)}%)`
    } else if (direction === 'decrease') {
      return `Baseline ${baseline}% should decrease to ${target}% (-${diff.toFixed(1)}%)`
    } else {
      return `Baseline ${baseline}% should maintain at ${target}%`
    }
  }
}

/**
 * Validate custom target against calculated target
 */
export function validateCustomTarget(
  calculated_target: number,
  custom_target: number,
  is_reduction_target: boolean
): {
  is_valid: boolean
  warning_message_km?: string
  warning_message_en?: string
} {
  const diff = Math.abs(custom_target - calculated_target)

  // For reduction targets, custom should be <= calculated
  if (is_reduction_target) {
    if (custom_target > calculated_target) {
      return {
        is_valid: false,
        warning_message_km: `គោលដៅផ្ទាល់ខ្លួន ${custom_target}% ខ្ពស់ជាងគោលដៅស្វ័យប្រវត្តិ ${calculated_target}%. សម្រាប់សូចនាករថយចុះ គោលដៅត្រូវតែទាបជាង។`,
        warning_message_en: `Custom target ${custom_target}% is higher than calculated ${calculated_target}%. For reduction indicators, target should be lower.`
      }
    }
  } else {
    // For increase targets, custom should be >= baseline
    if (custom_target < calculated_target - 5) {
      return {
        is_valid: true,
        warning_message_km: `គោលដៅផ្ទាល់ខ្លួន ${custom_target}% ទាបជាងគោលដៅស្វ័យប្រវត្តិ ${calculated_target}%. តើអ្នកប្រាកដទេ?`,
        warning_message_en: `Custom target ${custom_target}% is lower than calculated ${calculated_target}%. Are you sure?`
      }
    }
  }

  return { is_valid: true }
}

/**
 * Get all indicators with calculation rules
 */
export async function getAllIndicatorsWithRules() {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const indicators = await prisma.indicators.findMany({
      where: { is_active: true },
      orderBy: { indicator_number: 'asc' }
    })
    return indicators
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Calculate target for a specific indicator and baseline
 */
export async function calculateTargetForIndicator(
  indicator_code: string,
  partner_baseline: number
): Promise<TargetCalculationResult> {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const indicator = await prisma.indicators.findUnique({
      where: { indicator_code }
    })

    if (!indicator) {
      throw new Error(`Indicator ${indicator_code} not found`)
    }

    return calculateTarget({
      indicator: indicator as unknown as Indicator,
      partner_baseline
    })
  } finally {
    await prisma.$disconnect()
  }
}
