import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const contractTypes = [
    {
      type_name_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គបស និង គបក',
      type_name_english: 'Performance Agreement between PMU and PCU',
      template_file: '1_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង_គបស_និង_គបក.docx'
    },
    {
      type_name_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធាន គបក និងប្រធានគម្រោង',
      type_name_english: 'Performance Agreement between PCU Chief and Project Manager',
      template_file: '2_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគ_ប_ក_និងប្រធានគម្រោង.docx'
    },
    {
      type_name_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង និងមន្រ្តីគម្រោងតាមតំបន់',
      type_name_english: 'Performance Agreement between Project Manager and Regional Officers',
      template_file: '3_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង_និងមន្រ្តីគម្រោង តាមតំបន់.docx'
    },
    {
      type_name_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ',
      type_name_english: 'Performance Agreement between Primary Department and District Education Office',
      template_file: '4_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ.docx'
    },
    {
      type_name_khmer: 'កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងសាលាបឋមសិក្សា',
      type_name_english: 'Performance Agreement between Primary Department and Primary School',
      template_file: '5_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងសាលាបឋមសិក្សា.docx'
    }
  ]

  for (const contractType of contractTypes) {
    await prisma.contract_types.upsert({
      where: { id: contractTypes.indexOf(contractType) + 1 },
      update: contractType,
      create: {
        id: contractTypes.indexOf(contractType) + 1,
        ...contractType
      }
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })