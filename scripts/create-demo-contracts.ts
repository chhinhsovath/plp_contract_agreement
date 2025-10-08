/**
 * Script to create demo contracts for Type 4 and 5 users
 * Run with: npx tsx scripts/create-demo-contracts.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating demo contracts for Type 4 and 5 users...\n')

  // Get demo users
  const demoDoEDistrict = await prisma.users.findFirst({
    where: { phone_number: '0774444444' }
  })

  const demoDoESchool = await prisma.users.findFirst({
    where: { phone_number: '0775555555' }
  })

  if (!demoDoEDistrict || !demoDoESchool) {
    console.error('Demo users not found!')
    return
  }

  console.log('Found demo users:')
  console.log(`- ${demoDoEDistrict.full_name} (ID: ${demoDoEDistrict.id})`)
  console.log(`- ${demoDoESchool.full_name} (ID: ${demoDoESchool.id})\n`)

  // Create Type 4 contract (DoE-District)
  const contract4 = await prisma.contracts.create({
    data: {
      contract_type_id: 4,
      contract_number: 'DEMO-DOE-DISTRICT-001',
      party_a_name: 'នាយកដ្ឋានបឋមសិក្សា',
      party_a_position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
      party_a_signature: 'signature_data',
      party_a_signed_date: new Date(),
      party_b_name: demoDoEDistrict.full_name || 'ការិយាល័យអប់រំ',
      party_b_position: 'ប្រធានការិយាល័យអប់រំ',
      party_b_signature: 'signature_data',
      party_b_signed_date: new Date(),
      start_date: new Date('2025-10-01'),
      end_date: new Date('2026-09-30'),
      status: 'signed',
      created_by: demoDoEDistrict.id.toString()
    }
  })

  console.log(`✅ Created Type 4 contract (ID: ${contract4.id})`)

  // Create Type 5 contract (DoE-School)
  const contract5 = await prisma.contracts.create({
    data: {
      contract_type_id: 5,
      contract_number: 'DEMO-DOE-SCHOOL-001',
      party_a_name: 'ការិយាល័យអប់រំ',
      party_a_position: 'ប្រធានការិយាល័យអប់រំ',
      party_a_signature: 'signature_data',
      party_a_signed_date: new Date(),
      party_b_name: demoDoESchool.full_name || 'នាយកសាលា',
      party_b_position: 'នាយកសាលា',
      party_b_signature: 'signature_data',
      party_b_signed_date: new Date(),
      start_date: new Date('2025-10-01'),
      end_date: new Date('2026-09-30'),
      status: 'signed',
      created_by: demoDoESchool.id.toString()
    }
  })

  console.log(`✅ Created Type 5 contract (ID: ${contract5.id})`)

  // Get deliverables for Type 4 and create selections
  const deliverables4 = await prisma.contract_deliverables.findMany({
    where: { contract_type: 4 },
    include: {
      options: {
        where: { is_active: true },
        orderBy: { option_number: 'asc' }
      }
    },
    orderBy: { deliverable_number: 'asc' }
  })

  console.log(`\nCreating deliverable selections for Type 4 (${deliverables4.length} deliverables)...`)

  for (const deliverable of deliverables4) {
    // Select option 2 (equal baseline) for demo purposes
    const selectedOption = deliverable.options[1] || deliverable.options[0]

    await prisma.contract_deliverable_selections.create({
      data: {
        contract_id: contract4.id,
        deliverable_id: deliverable.id,
        selected_option_id: selectedOption.id,
        selected_by: demoDoEDistrict.id.toString(),
        selected_at: new Date()
      }
    })

    console.log(`  ✓ Deliverable ${deliverable.deliverable_number}: Selected option ${selectedOption.option_number}`)
  }

  // Get deliverables for Type 5 and create selections
  const deliverables5 = await prisma.contract_deliverables.findMany({
    where: { contract_type: 5 },
    include: {
      options: {
        where: { is_active: true },
        orderBy: { option_number: 'asc' }
      }
    },
    orderBy: { deliverable_number: 'asc' }
  })

  console.log(`\nCreating deliverable selections for Type 5 (${deliverables5.length} deliverables)...`)

  for (const deliverable of deliverables5) {
    // Select option 2 (equal baseline) for demo purposes
    const selectedOption = deliverable.options[1] || deliverable.options[0]

    await prisma.contract_deliverable_selections.create({
      data: {
        contract_id: contract5.id,
        deliverable_id: deliverable.id,
        selected_option_id: selectedOption.id,
        selected_by: demoDoESchool.id.toString(),
        selected_at: new Date()
      }
    })

    console.log(`  ✓ Deliverable ${deliverable.deliverable_number}: Selected option ${selectedOption.option_number}`)
  }

  console.log('\n✅ Demo contracts and deliverable selections created successfully!')
  console.log('\nTest with these users:')
  console.log(`- Phone: 0774444444 (Type 4 - DoE-District)`)
  console.log(`- Phone: 0775555555 (Type 5 - DoE-School)`)
  console.log('\nBoth should now see the សមិទ្ធកម្ម tab in ME Dashboard!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
