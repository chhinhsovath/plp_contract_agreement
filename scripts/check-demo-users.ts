import { prisma } from '../lib/prisma'

async function checkDemoUsers() {
  const users = await prisma.users.findMany({
    where: {
      phone_number: {
        in: ['0774444444', '0775555555']
      }
    },
    select: {
      id: true,
      full_name: true,
      phone_number: true,
      role: true,
      contract_type: true
    }
  })

  console.log('Demo Users Contract Types:')
  users.forEach(u => {
    console.log(`${u.full_name} (${u.phone_number}): contract_type = ${u.contract_type}`)
  })

  await prisma.$disconnect()
}

checkDemoUsers().catch(console.error)
