import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function backupData() {
  try {
    console.log('Starting backup...')

    // Backup users table
    const users = await prisma.users.findMany()
    fs.writeFileSync(
      path.join('backups', 'users_backup.json'),
      JSON.stringify(users, null, 2)
    )
    console.log(`Backed up ${users.length} users`)

    // Backup contract_types table
    const contractTypes = await prisma.contract_types.findMany()
    fs.writeFileSync(
      path.join('backups', 'contract_types_backup.json'),
      JSON.stringify(contractTypes, null, 2)
    )
    console.log(`Backed up ${contractTypes.length} contract types`)

    // Backup contracts table
    const contracts = await prisma.contracts.findMany({
      include: {
        contract_fields: true,
        attachments: true
      }
    })
    fs.writeFileSync(
      path.join('backups', 'contracts_backup.json'),
      JSON.stringify(contracts, null, 2)
    )
    console.log(`Backed up ${contracts.length} contracts`)

    console.log('Backup completed successfully!')
    console.log('Backup files saved in ./backups/ directory')

  } catch (error) {
    console.error('Backup failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backupData()