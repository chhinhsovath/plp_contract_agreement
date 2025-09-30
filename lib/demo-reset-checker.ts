/**
 * Demo Reset Checker
 * This module checks if demo users need to be reset every 24 hours
 * It's called on login and periodically to ensure demo data stays fresh
 */

const RESET_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
let lastCheckTime: Date | null = null
const CHECK_INTERVAL = 60 * 60 * 1000 // Check every hour

export async function checkAndResetDemoUsers() {
  try {
    // Avoid checking too frequently
    if (lastCheckTime) {
      const timeSinceLastCheck = Date.now() - lastCheckTime.getTime()
      if (timeSinceLastCheck < CHECK_INTERVAL) {
        return // Skip check if less than an hour has passed
      }
    }

    lastCheckTime = new Date()

    // Check if reset is needed
    const checkResponse = await fetch('/api/demo/reset', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!checkResponse.ok) {
      console.error('Failed to check demo reset status')
      return
    }

    const status = await checkResponse.json()

    if (status.needsReset) {
      console.log('🔄 Demo users need reset. Triggering reset...')

      // Trigger reset
      const resetResponse = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      })

      if (resetResponse.ok) {
        const result = await resetResponse.json()
        console.log('✅ Demo users reset successful:', result)
      } else {
        console.error('Failed to reset demo users')
      }
    } else {
      console.log(`⏰ Next demo reset in ${status.hoursUntilNextReset?.toFixed(1)} hours`)
    }
  } catch (error) {
    console.error('Error in demo reset checker:', error)
  }
}

// Optional: Set up periodic checking (for long-running sessions)
export function setupPeriodicResetCheck() {
  // Check every hour
  setInterval(checkAndResetDemoUsers, CHECK_INTERVAL)

  // Also check immediately
  checkAndResetDemoUsers()
}