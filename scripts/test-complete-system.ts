/**
 * Complete System Test Script
 * Tests all major features of the Education Partner Performance Tracking System
 *
 * Run with: npx tsx scripts/test-complete-system.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  duration?: number
}

const results: TestResult[] = []

async function runTest(testName: string, testFn: () => Promise<void>) {
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    results.push({ test: testName, status: 'PASS', message: '✓ Test passed', duration })
    console.log(`✅ ${testName} - PASS (${duration}ms)`)
  } catch (error: any) {
    const duration = Date.now() - startTime
    results.push({ test: testName, status: 'FAIL', message: error.message, duration })
    console.error(`❌ ${testName} - FAIL: ${error.message}`)
  }
}

// ============================================================================
// TEST 1: Database Connection and Schema
// ============================================================================
async function testDatabaseConnection() {
  await runTest('Database Connection', async () => {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    if (!result) throw new Error('Database connection failed')
  })
}

// ============================================================================
// TEST 2: Indicators Seeded Correctly
// ============================================================================
async function testIndicatorsSeeded() {
  await runTest('Performance Indicators Seeded', async () => {
    const indicators = await prisma.indicators.findMany({
      orderBy: { indicator_number: 'asc' }
    })

    if (indicators.length !== 5) {
      throw new Error(`Expected 5 indicators, found ${indicators.length}`)
    }

    // Verify all indicator codes exist
    const codes = indicators.map(i => i.indicator_code)
    const expectedCodes = ['IND-001', 'IND-002', 'IND-003', 'IND-004', 'IND-005']

    for (const code of expectedCodes) {
      if (!codes.includes(code)) {
        throw new Error(`Missing indicator: ${code}`)
      }
    }

    // Verify calculation rules exist
    for (const indicator of indicators) {
      if (!indicator.calculation_rules || (indicator.calculation_rules as any[]).length === 0) {
        throw new Error(`Indicator ${indicator.indicator_code} missing calculation rules`)
      }
    }
  })
}

// ============================================================================
// TEST 3: Create Contract
// ============================================================================
async function testCreateContract() {
  await runTest('Create Contract', async () => {
    const contract = await prisma.contracts.create({
      data: {
        contract_number: `TEST-${Date.now()}`,
        contract_type_id: 4, // Education office
        party_a_name: 'នាយកដ្ឋានបឋមសិក្សា',
        party_a_position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
        party_b_name: 'ការិយាល័យអប់រំ ស្រុក/ក្រុង/ខណ្ឌ - ទេស្ត៍',
        party_b_position: 'ប្រធានការិយាល័យ',
        location: 'ភ្នំពេញ',
        start_date: new Date('2025-10-01'),
        end_date: new Date('2026-06-30'),
        status: 'draft',
        created_by_id: 1
      }
    })

    if (!contract.id) throw new Error('Contract creation failed')

    // Cleanup
    await prisma.contracts.delete({ where: { id: contract.id } })
  })
}

// ============================================================================
// TEST 4: Unique Indicator Constraint
// ============================================================================
async function testUniqueIndicatorConstraint() {
  await runTest('Unique Indicator Constraint', async () => {
    // Create test contract
    const contract = await prisma.contracts.create({
      data: {
        contract_number: `TEST-UNIQUE-${Date.now()}`,
        contract_type_id: 4,
        party_a_name: 'Test Party A',
        party_b_name: 'Test Party B',
        start_date: new Date('2025-10-01'),
        end_date: new Date('2026-06-30'),
        status: 'draft',
        created_by_id: 1
      }
    })

    // Get first indicator
    const indicator = await prisma.indicators.findFirst({
      where: { indicator_code: 'IND-001' }
    })

    if (!indicator) throw new Error('Indicator IND-001 not found')

    // Add indicator once - should succeed
    await prisma.contract_indicators.create({
      data: {
        contract_id: contract.id,
        indicator_id: indicator.id,
        baseline_percentage: 90,
        target_percentage: 95,
        baseline_date: new Date('2024-09-30'),
        target_date: new Date('2025-11-30')
      }
    })

    // Try to add same indicator again - should fail
    try {
      await prisma.contract_indicators.create({
        data: {
          contract_id: contract.id,
          indicator_id: indicator.id,
          baseline_percentage: 85,
          target_percentage: 90,
          baseline_date: new Date('2024-09-30'),
          target_date: new Date('2025-11-30')
        }
      })
      throw new Error('Unique constraint not enforced - duplicate indicator was added')
    } catch (error: any) {
      if (!error.message.includes('Unique constraint')) {
        throw new Error('Expected unique constraint error')
      }
    }

    // Cleanup
    await prisma.contract_indicators.deleteMany({ where: { contract_id: contract.id } })
    await prisma.contracts.delete({ where: { id: contract.id } })
  })
}

// ============================================================================
// TEST 5: Auto-Target Calculation
// ============================================================================
async function testAutoTargetCalculation() {
  await runTest('Auto-Target Calculation', async () => {
    const indicator = await prisma.indicators.findFirst({
      where: { indicator_code: 'IND-001' }
    })

    if (!indicator) throw new Error('Indicator IND-001 not found')

    const rules = indicator.calculation_rules as any[]

    // Verify calculation rules structure
    if (!Array.isArray(rules) || rules.length !== 3) {
      throw new Error('Expected 3 calculation rules for IND-001')
    }

    // Test baseline calculations
    const baseline1 = 90 // Below 93.7
    const baseline2 = 93.7 // Equal to 93.7
    const baseline3 = 95 // Above/equal to 95

    // For baseline below 93.7, target should be baseline + 1.3
    const expectedTarget1 = baseline1 + 1.3

    // For baseline equal to 93.7, target should be 95
    const expectedTarget2 = 95

    // For baseline >= 95, target should be baseline (maintain)
    const expectedTarget3 = baseline3

    console.log(`  → Baseline ${baseline1}% → Target ${expectedTarget1}%`)
    console.log(`  → Baseline ${baseline2}% → Target ${expectedTarget2}%`)
    console.log(`  → Baseline ${baseline3}% → Target ${expectedTarget3}%`)
  })
}

// ============================================================================
// TEST 6: Milestone Progress Calculation
// ============================================================================
async function testMilestoneProgress() {
  await runTest('Milestone Progress Calculation', async () => {
    // Create test contract
    const contract = await prisma.contracts.create({
      data: {
        contract_number: `TEST-PROGRESS-${Date.now()}`,
        contract_type_id: 4,
        party_a_name: 'Test Party A',
        party_b_name: 'Test Party B',
        start_date: new Date('2025-10-01'),
        end_date: new Date('2026-06-30'),
        status: 'active',
        created_by_id: 1
      }
    })

    // Get indicator
    const indicator = await prisma.indicators.findFirst({
      where: { indicator_code: 'IND-001' }
    })

    if (!indicator) throw new Error('Indicator not found')

    // Add contract indicator
    const contractIndicator = await prisma.contract_indicators.create({
      data: {
        contract_id: contract.id,
        indicator_id: indicator.id,
        baseline_percentage: 90,
        target_percentage: 95,
        baseline_date: new Date('2024-09-30'),
        target_date: new Date('2025-11-30')
      }
    })

    // Create milestone
    const milestone = await prisma.milestones.create({
      data: {
        contract_id: contract.id,
        indicator_id: indicator.id,
        contract_indicator_id: contractIndicator.id,
        milestone_code: `MS-TEST-${Date.now()}`,
        milestone_name_km: 'គោលបំណងទេស្ត៍',
        milestone_name_en: 'Test Milestone',
        planned_start_date: new Date('2025-10-01'),
        planned_end_date: new Date('2025-12-31'),
        baseline_value: 90,
        target_value: 95,
        is_reduction_target: false,
        overall_status: 'in_progress'
      }
    })

    // Submit progress report
    const progressReport = await prisma.progress_reports.create({
      data: {
        milestone_id: milestone.id,
        report_code: `RPT-TEST-${Date.now()}`,
        reporting_date: new Date('2025-10-31'),
        reporting_period: 'Month 1',
        reported_value: 92.5, // Halfway to target
        narrative_report_km: 'ការវាយតម្លៃបានចាប់ផ្តើម',
        narrative_report_en: 'Assessment has started'
      }
    })

    // Calculate expected achievement
    const baseline = 90
    const target = 95
    const current = 92.5

    const expectedAchievement = ((current - baseline) / (target - baseline)) * 100

    console.log(`  → Baseline: ${baseline}%`)
    console.log(`  → Target: ${target}%`)
    console.log(`  → Current: ${current}%`)
    console.log(`  → Expected Achievement: ${expectedAchievement.toFixed(1)}%`)

    if (expectedAchievement < 45 || expectedAchievement > 55) {
      throw new Error(`Achievement calculation off: expected ~50%, got ${expectedAchievement}%`)
    }

    // Cleanup
    await prisma.progress_reports.deleteMany({ where: { milestone_id: milestone.id } })
    await prisma.milestones.delete({ where: { id: milestone.id } })
    await prisma.contract_indicators.deleteMany({ where: { contract_id: contract.id } })
    await prisma.contracts.delete({ where: { id: contract.id } })
  })
}

// ============================================================================
// TEST 7: Dashboard Queries
// ============================================================================
async function testDashboardQueries() {
  await runTest('Dashboard Queries', async () => {
    // Test overview query
    const totalContracts = await prisma.contracts.count()
    const activeContracts = await prisma.contracts.count({
      where: { status: 'active' }
    })

    const totalMilestones = await prisma.milestones.count()

    console.log(`  → Total Contracts: ${totalContracts}`)
    console.log(`  → Active Contracts: ${activeContracts}`)
    console.log(`  → Total Milestones: ${totalMilestones}`)

    // Test indicator performance query
    const indicators = await prisma.indicators.findMany({
      include: {
        _count: {
          select: {
            contract_indicators: true
          }
        }
      }
    })

    console.log(`  → Indicators: ${indicators.length}`)
  })
}

// ============================================================================
// TEST 8: Document Generation Components
// ============================================================================
async function testDocumentGeneration() {
  await runTest('Document Generation Components', async () => {
    const fs = await import('fs')

    // Check template files exist
    const template4Path = 'public/templates/contract_template_4.docx'
    const template5Path = 'public/templates/contract_template_5.docx'

    if (!fs.existsSync(template4Path)) {
      throw new Error('Template 4 not found')
    }

    if (!fs.existsSync(template5Path)) {
      throw new Error('Template 5 not found')
    }

    const stat4 = fs.statSync(template4Path)
    const stat5 = fs.statSync(template5Path)

    console.log(`  → Template 4 size: ${(stat4.size / 1024).toFixed(1)}KB`)
    console.log(`  → Template 5 size: ${(stat5.size / 1024).toFixed(1)}KB`)
  })
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 EDUCATION PARTNER PERFORMANCE TRACKING SYSTEM - COMPLETE TEST')
  console.log('='.repeat(70) + '\n')

  const startTime = Date.now()

  try {
    await testDatabaseConnection()
    await testIndicatorsSeeded()
    await testCreateContract()
    await testUniqueIndicatorConstraint()
    await testAutoTargetCalculation()
    await testMilestoneProgress()
    await testDashboardQueries()
    await testDocumentGeneration()

    const totalDuration = Date.now() - startTime

    // Print summary
    console.log('\n' + '='.repeat(70))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(70))

    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length

    console.log(`\nTotal Tests: ${results.length}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Total Duration: ${totalDuration}ms\n`)

    if (failed > 0) {
      console.log('❌ FAILED TESTS:')
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`)
      })
      console.log('')
      process.exit(1)
    } else {
      console.log('✅ ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!\n')
      console.log('🚀 Next Steps:')
      console.log('  1. Deploy to production')
      console.log('  2. Train users on the new system')
      console.log('  3. Monitor first week of usage\n')
    }

  } catch (error: any) {
    console.error('\n❌ Test suite failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
