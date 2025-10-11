import { prisma } from '../lib/prisma'

async function checkDemoUserContracts() {
  // Check Demo DoE-District User (Type 4)
  const user = await prisma.users.findFirst({
    where: {
      phone_number: '0774444444'
    },
    select: {
      id: true,
      full_name: true,
      contract_type: true,
      contract_signed: true
    }
  })

  console.log('User:', user)

  if (!user) {
    console.log('User not found')
    await prisma.$disconnect()
    return
  }

  // Get contracts
  const contracts = await prisma.contracts.findMany({
    where: user.contract_type ? {
      contract_type_id: user.contract_type
    } : {},
    select: {
      id: true,
      contract_type_id: true,
      created_by: true,
      party_a_name: true,
      party_b_name: true
    }
  })

  console.log('\nContracts for Type 4:', contracts.length)
  contracts.forEach(c => console.log(`  - Contract ${c.id}: ${c.party_a_name} - ${c.party_b_name}`))

  if (contracts.length > 0) {
    const selections = await prisma.contract_deliverable_selections.findMany({
      where: {
        contract_id: { in: contracts.map(c => c.id) }
      }
    })

    console.log(`\nDeliverable selections: ${selections.length}`)
  }

  await prisma.$disconnect()
}

checkDemoUserContracts().catch(console.error)
