#!/usr/bin/env node

/**
 * Connection Pattern Checker
 *
 * Scans API routes for potential connection pool issues:
 * - Missing await on Prisma queries
 * - Manual $disconnect() calls
 * - Creating new PrismaClient instances
 * - Unbatched loops with database operations
 */

const fs = require('fs')
const path = require('path')

const apiDir = path.join(__dirname, '../app/api')
const issues = []

function scanDirectory(directory) {
  const files = fs.readdirSync(directory)

  for (const file of files) {
    const filePath = path.join(directory, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      scanDirectory(filePath)
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      scanFile(filePath)
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const relativePath = path.relative(process.cwd(), filePath)

  // Check 1: Missing await on Prisma queries
  const prismaCallsWithoutAwait = []
  lines.forEach((line, index) => {
    // Match: prisma.table.method() but not: await prisma.table.method()
    if (
      line.match(/[^await\s]prisma\.\w+\.\w+\(/i) &&
      !line.includes('await prisma') &&
      !line.includes('// @ts-') &&
      !line.includes('const prisma =')
    ) {
      prismaCallsWithoutAwait.push({
        line: index + 1,
        content: line.trim(),
      })
    }
  })

  if (prismaCallsWithoutAwait.length > 0) {
    issues.push({
      file: relativePath,
      type: 'MISSING_AWAIT',
      severity: 'HIGH',
      message: 'Prisma query without await keyword',
      occurrences: prismaCallsWithoutAwait,
    })
  }

  // Check 2: Manual $disconnect calls
  const disconnectCalls = []
  lines.forEach((line, index) => {
    if (line.includes('$disconnect')) {
      disconnectCalls.push({
        line: index + 1,
        content: line.trim(),
      })
    }
  })

  if (disconnectCalls.length > 0) {
    issues.push({
      file: relativePath,
      type: 'MANUAL_DISCONNECT',
      severity: 'MEDIUM',
      message: 'Manual $disconnect() call found (not recommended in serverless)',
      occurrences: disconnectCalls,
    })
  }

  // Check 3: Creating new PrismaClient instances
  const newPrismaInstances = []
  lines.forEach((line, index) => {
    if (line.includes('new PrismaClient()')) {
      newPrismaInstances.push({
        line: index + 1,
        content: line.trim(),
      })
    }
  })

  if (newPrismaInstances.length > 0) {
    issues.push({
      file: relativePath,
      type: 'NEW_PRISMA_INSTANCE',
      severity: 'CRITICAL',
      message: 'Creating new PrismaClient instance (should use singleton)',
      occurrences: newPrismaInstances,
    })
  }

  // Check 4: Potential unbatched loops
  const unbatchedLoops = []
  let inLoop = false
  let loopStartLine = 0

  lines.forEach((line, index) => {
    // Detect loop start
    if (line.match(/for\s*\(|\.forEach\(|\.map\(/i)) {
      inLoop = true
      loopStartLine = index + 1
    }

    // Detect Prisma operations inside loop
    if (inLoop && line.match(/await\s+prisma\.\w+\.(create|update|delete|upsert)\(/i)) {
      unbatchedLoops.push({
        line: loopStartLine,
        prismaLine: index + 1,
        content: line.trim(),
      })
      inLoop = false // Reset to avoid multiple detections
    }

    // Reset loop detection on closing brace
    if (line.trim() === '}') {
      inLoop = false
    }
  })

  if (unbatchedLoops.length > 0) {
    issues.push({
      file: relativePath,
      type: 'UNBATCHED_LOOP',
      severity: 'MEDIUM',
      message: 'Potential unbatched database operations in loop',
      occurrences: unbatchedLoops.map((item) => ({
        line: item.loopStartLine,
        content: `Loop at line ${item.loopStartLine}, Prisma call at line ${item.prismaLine}`,
      })),
    })
  }

  // Check 5: Missing error handling
  const missingErrorHandling = []
  let hasTryCatch = content.includes('try {') && content.includes('catch')

  if (!hasTryCatch && content.includes('prisma.')) {
    missingErrorHandling.push({
      line: 1,
      content: 'File uses Prisma but has no try-catch blocks',
    })
  }

  if (missingErrorHandling.length > 0) {
    issues.push({
      file: relativePath,
      type: 'MISSING_ERROR_HANDLING',
      severity: 'LOW',
      message: 'API route missing try-catch error handling',
      occurrences: missingErrorHandling,
    })
  }
}

// Run the scan
console.log('🔍 Scanning API routes for connection pattern issues...\n')
scanDirectory(apiDir)

// Report results
if (issues.length === 0) {
  console.log('✅ No connection pattern issues found!\n')
  process.exit(0)
}

console.log(`⚠️  Found ${issues.length} potential issues:\n`)

const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL')
const highIssues = issues.filter((i) => i.severity === 'HIGH')
const mediumIssues = issues.filter((i) => i.severity === 'MEDIUM')
const lowIssues = issues.filter((i) => i.severity === 'LOW')

function printIssues(issueList, emoji) {
  issueList.forEach((issue) => {
    console.log(`${emoji} [${issue.severity}] ${issue.file}`)
    console.log(`   ${issue.message}`)
    issue.occurrences.forEach((occurrence) => {
      console.log(`   Line ${occurrence.line}: ${occurrence.content}`)
    })
    console.log()
  })
}

if (criticalIssues.length > 0) {
  console.log('🔴 CRITICAL ISSUES (Must fix immediately):')
  printIssues(criticalIssues, '🔴')
}

if (highIssues.length > 0) {
  console.log('🟠 HIGH PRIORITY ISSUES (Fix soon):')
  printIssues(highIssues, '🟠')
}

if (mediumIssues.length > 0) {
  console.log('🟡 MEDIUM PRIORITY ISSUES (Review and fix):')
  printIssues(mediumIssues, '🟡')
}

if (lowIssues.length > 0) {
  console.log('🔵 LOW PRIORITY ISSUES (Consider improving):')
  printIssues(lowIssues, '🔵')
}

// Summary
console.log('═'.repeat(80))
console.log('📊 SUMMARY:')
console.log(`   Critical: ${criticalIssues.length}`)
console.log(`   High:     ${highIssues.length}`)
console.log(`   Medium:   ${mediumIssues.length}`)
console.log(`   Low:      ${lowIssues.length}`)
console.log(`   Total:    ${issues.length}`)
console.log('═'.repeat(80))

// Exit with error code if critical or high issues found
if (criticalIssues.length > 0 || highIssues.length > 0) {
  console.log('\n❌ Fix critical and high priority issues before deploying to production!')
  process.exit(1)
} else {
  console.log('\n✅ No critical issues found. Review medium/low priority items when possible.')
  process.exit(0)
}
