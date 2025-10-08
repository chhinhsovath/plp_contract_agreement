import { prisma } from '../lib/prisma';

async function verify() {
  console.log('🔍 Verifying deliverables data...\n');

  const deliverablesByType = await prisma.contract_deliverables.groupBy({
    by: ['contract_type'],
    _count: true
  });

  console.log('📊 Deliverables by Contract Type:');
  deliverablesByType.forEach(item => {
    console.log(`   Type ${item.contract_type}: ${item._count} deliverables`);
  });

  const totalOptions = await prisma.deliverable_options.count();
  console.log(`\n✅ Total Options: ${totalOptions}`);

  const sampleDeliverable = await prisma.contract_deliverables.findFirst({
    where: { contract_type: 4 },
    include: { options: true }
  });

  if (sampleDeliverable) {
    console.log(`\n📋 Sample Deliverable #${sampleDeliverable.deliverable_number}:`);
    console.log(`   Title: ${sampleDeliverable.deliverable_title_khmer.substring(0, 50)}...`);
    console.log(`   Options: ${sampleDeliverable.options.length}`);
  }

  console.log('\n✅ Verification complete!');
  await prisma.$disconnect();
}

verify().catch(console.error);
