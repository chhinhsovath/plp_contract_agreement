import { prisma } from '../lib/prisma'

async function checkDemoContracts() {
  // Get demo users
  const demoUsers = await prisma.users.findMany({
    where: {
      phone_number: {
        in: ['0774444444', '0775555555']
      }
    },
    select: {
      id: true,
      full_name: true,
      phone_number: true,
      contract_type: true
    }
  })

  console.log('Demo Users:')
  demoUsers.forEach(u => {
    console.log(`- ${u.full_name} (${u.phone_number}): contract_type = ${u.contract_type}`)
  })

  // Get contracts created by these users
  const contracts = await prisma.contracts.findMany({
    where: {
      OR: [
        { created_by: { in: demoUsers.map(u => u.id.toString()) } },
        { party_a_name: { contains: 'Demo' } },
        { party_b_name: { contains: 'Demo' } }
      ]
    },
    select: {
      id: true,
      contract_type_id: true,
      party_a_name: true,
      party_b_name: true,
      created_by: true,
      created_at: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  console.log(`\n${contracts.length} Contract(s) for Demo Users:`)
  contracts.forEach(c => {
    console.log(`- Contract ${c.id}: Type ${c.contract_type_id} | ${c.party_a_name} - ${c.party_b_name}`)
  })

  // Check for deliverable selections
  if (contracts.length > 0) {
    const contractIds = contracts.map(c => c.id)
    const selections = await prisma.contract_deliverable_selections.findMany({
      where: {
        contract_id: { in: contractIds }
      },
      select: {
        contract_id: true,
        deliverable_id: true
      }
    })

    console.log(`\nDeliverable Selections: ${selections.length}`)
    selections.forEach(s => {
      console.log(`- Contract ${s.contract_id}: Deliverable ${s.deliverable_id}`)
    })
  }

  await prisma.$disconnect()
}

checkDemoContracts().catch(console.error)
