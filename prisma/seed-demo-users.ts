import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed demo users for 5 agreement types...')

  // Demo users for each agreement type
  const demoUsers = [
    {
      full_name: 'Demo PMU-PCU User',
      phone_number: '0771111111',
      passcode: '1111', // Last 4 digits
      role: 'PARTNER',
      contract_type: 1, // PMU-PCU Agreement
      organization: 'Provincial Coordination Unit',
      position: 'PCU Coordinator',
      email: 'pmu-pcu@demo.com'
    },
    {
      full_name: 'Demo PCU-PM User',
      phone_number: '0772222222',
      passcode: '2222', // Last 4 digits
      role: 'PARTNER',
      contract_type: 2, // PCU-Project Manager Agreement
      organization: 'Project Management Office',
      position: 'Project Manager',
      email: 'pcu-pm@demo.com'
    },
    {
      full_name: 'Demo PM-Regional User',
      phone_number: '0773333333',
      passcode: '3333', // Last 4 digits
      role: 'PARTNER',
      contract_type: 3, // Project Manager-Regional Agreement
      organization: 'Regional Coordination Office',
      position: 'Regional Coordinator',
      email: 'pm-regional@demo.com'
    },
    {
      full_name: 'Demo DoE-District User',
      phone_number: '0774444444',
      passcode: '4444', // Last 4 digits
      role: 'PARTNER',
      contract_type: 4, // DoE-District Office Agreement
      organization: 'District Office of Education',
      position: 'District Education Officer',
      email: 'doe-district@demo.com'
    },
    {
      full_name: 'Demo DoE-School User',
      phone_number: '0775555555',
      passcode: '5555', // Last 4 digits
      role: 'PARTNER',
      contract_type: 5, // DoE-School Agreement
      organization: 'Primary School',
      position: 'School Director',
      email: 'doe-school@demo.com'
    }
  ]

  // Also create one admin user for testing
  const adminUser = {
    full_name: 'Demo Admin User',
    phone_number: '0776666666',
    passcode: '6666',
    role: 'ADMIN',
    contract_type: null, // Admin can see all
    organization: 'PLP Administration',
    position: 'System Administrator',
    email: 'admin@demo.com'
  }

  // Create demo users
  for (const userData of [...demoUsers, adminUser]) {
    try {
      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { phone_number: userData.phone_number }
      })

      if (existingUser) {
        console.log(`⚠️  User with phone ${userData.phone_number} already exists, skipping...`)
        continue
      }

      // Create user with plain passcode (matching the system's approach)
      const user = await prisma.users.create({
        data: {
          ...userData,
          passcode: userData.passcode, // Store plain passcode as system does
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      console.log(`✅ Created ${user.role} user: ${user.full_name} (${user.phone_number})`)
    } catch (error) {
      console.error(`❌ Error creating user ${userData.full_name}:`, error)
    }
  }

  console.log('\n📋 Demo User Credentials for Testing:')
  console.log('=====================================')
  console.log('\n🔐 Agreement Type Users (PARTNER role):')
  console.log('1. PMU-PCU Agreement:     0771111111 / 1111')
  console.log('2. PCU-PM Agreement:      0772222222 / 2222')
  console.log('3. PM-Regional Agreement: 0773333333 / 3333')
  console.log('4. DoE-District Agreement:0774444444 / 4444')
  console.log('5. DoE-School Agreement:  0775555555 / 5555')
  console.log('\n👨‍💼 Admin User:')
  console.log('   Admin Access:          0776666666 / 6666')
  console.log('\n🔑 Super Admin (existing):')
  console.log('   Super Admin Access:    077806680 / 6680')
  console.log('=====================================\n')
}

main()
  .catch((e) => {
    console.error('Error in seed script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })