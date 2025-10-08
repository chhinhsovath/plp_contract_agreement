/**
 * Seed script for contract deliverables and options
 * For Agreement Types 4 and 5
 *
 * Run with: npx tsx prisma/seed-deliverables.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for contract deliverables and options...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing deliverables data...');
  await prisma.contract_deliverable_selections.deleteMany({});
  await prisma.deliverable_options.deleteMany({});
  await prisma.contract_deliverables.deleteMany({});
  console.log('✅ Cleared existing data\n');

  // ============================================
  // DELIVERABLES DATA
  // Both Agreement 4 and 5 have the same deliverables
  // ============================================

  const deliverablesData = [
    {
      deliverable_number: 1,
      deliverable_title_khmer: 'ភាគរយកុមារចុះឈ្មោះចូលរៀនថ្នាក់ទី១ត្រឹមត្រូវតាមអាយុ (៩៥%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៩៣.៧%',
      deliverable_title_english: 'Percentage of children enrolled in Grade 1 at the correct age (95%) in academic year 2025-2026 compared to baseline 93.7%',
      timeline: 'ខែតុលា-ខែវិច្ឆិកា ឆ្នាំ២០២៥',
      activities_text_type5: '- រៀបចំផែនទីខ្នងផ្ទះតាមសាលារៀន\n- ធ្វើយុទ្ធនាការប្រមូលកុមារចូលរៀន ជាពិសេសកុមារដល់វ័យសិក្សា\n- ប្រជុំជាមួយអាជ្ញាធរមូលដ្ឋានតាមសាលារៀន ដើម្បីជួយសម្របសម្រួលក្នុងការប្រមូលកុមារចូលរៀន',
      options: [
        {
          option_number: 1,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៩៣.៧% ត្រូវបង្កើន១.៣% នៅឆ្នាំសិក្សា២០២៥-២០២៦',
          option_text_english: 'If baseline < 93.7%, increase by 1.3% in 2025-2026',
          condition_type: 'less_than',
          baseline_percentage: 93.7,
          target_percentage: 95.0
        },
        {
          option_number: 2,
          option_text_khmer: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៩៣.៧% ត្រូវបង្កើនដល់ ៩៥%',
          option_text_english: 'If baseline = 93.7%, increase to 95%',
          condition_type: 'equal',
          baseline_percentage: 93.7,
          target_percentage: 95.0
        },
        {
          option_number: 3,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៩៥% ឬលើសត្រូវរក្សា យ៉ាងហោចណាស់ អោយនៅដដែល',
          option_text_english: 'If baseline ≥ 95%, maintain at least the same level',
          condition_type: 'greater_or_equal',
          baseline_percentage: 95.0,
          target_percentage: 95.0
        }
      ]
    },
    {
      deliverable_number: 2,
      deliverable_title_khmer: 'ភាគរយសាលាបឋមសិក្សាមានបណ្ណព័ត៌មានសាលារៀន (៤៦%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៣៦%',
      deliverable_title_english: 'Percentage of primary schools with school information boards (46%) in 2025-2026 compared to baseline 36%',
      timeline: 'ខែតុលា ឆ្នាំ២០២៥- ខែកុម្ភៈ ឆ្នាំ២០២៦',
      activities_text_type5: '- រៀបចំបង្កើតបណ្ណព័ត៌មានសាលារៀន',
      options: [
        {
          option_number: 1,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៣៦% ត្រូវបង្កើន១០% នៅឆ្នាំសិក្សា២០២៥-២០២៦',
          option_text_english: 'If baseline < 36%, increase by 10% in 2025-2026',
          condition_type: 'less_than',
          baseline_percentage: 36.0,
          target_percentage: 46.0
        },
        {
          option_number: 2,
          option_text_khmer: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៣៦% ត្រូវបង្កើនដល់ ៤៦%',
          option_text_english: 'If baseline = 36%, increase to 46%',
          condition_type: 'equal',
          baseline_percentage: 36.0,
          target_percentage: 46.0
        },
        {
          option_number: 3,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៤៦% ឬលើសត្រូវរក្សា យ៉ាងហោចណាស់ អោយនៅដដែល',
          option_text_english: 'If baseline ≥ 46%, maintain at least the same level',
          condition_type: 'greater_or_equal',
          baseline_percentage: 46.0,
          target_percentage: 46.0
        }
      ]
    },
    {
      deliverable_number: 3,
      deliverable_title_khmer: 'ភាគរយសាលារៀនរៀបចំបង្កើតគណៈកម្មការគ្រប់គ្រងសាលារៀន (៥០%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៣០%',
      deliverable_title_english: 'Percentage of schools establishing school management committees (50%) in 2025-2026 compared to baseline 30%',
      timeline: 'ខែតុលា ឆ្នាំ២០២៥- ខែមីនា ឆ្នាំ២០២៦',
      activities_text_type5: '- បង្កើតគណៈកម្មការគ្រប់គ្រងសាលារៀន តាមសេចក្តីណែនាំលេខ ៥៩ អយក.សណន ចុះថ្ងៃទី ១០.កញ្ញា.២០២១\n- ជំរុញលើកទឹកចិត្ត​ មូលដ្ឋានភូមិឃុំ ចូលរួមក្នុងគណៈកម្មាការដឹកនាំសាលា',
      options: [
        {
          option_number: 1,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ៣០% ត្រូវបង្កើន២០% នៅឆ្នាំសិក្សា២០២៥-២០២៦',
          option_text_english: 'If baseline < 30%, increase by 20% in 2025-2026',
          condition_type: 'less_than',
          baseline_percentage: 30.0,
          target_percentage: 50.0
        },
        {
          option_number: 2,
          option_text_khmer: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៣០% ត្រូវបង្កើនដល់ ៥០%',
          option_text_english: 'If baseline = 30%, increase to 50%',
          condition_type: 'equal',
          baseline_percentage: 30.0,
          target_percentage: 50.0
        },
        {
          option_number: 3,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៥០% ឬលើសត្រូវរក្សា យ៉ាងហោចណាស់ អោយនៅដដែល',
          option_text_english: 'If baseline ≥ 50%, maintain at least the same level',
          condition_type: 'greater_or_equal',
          baseline_percentage: 50.0,
          target_percentage: 50.0
        }
      ]
    },
    {
      deliverable_number: 4,
      deliverable_title_khmer: 'ភាគរយសិស្សដែលនៅក្រោមមូលដ្ឋានលើមុខវិជ្ជាភាសាខ្មែរ និងគណិតវិទ្យាថ្នាក់ទី៣ថយចុះ ៥% មកនៅ (៤៦%) នៅត្រីមាសទី១ ឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន (៥១ %) នៃតេស្តស្តង់ដាថ្នាក់ទី៣ ឆ្នាំ២០១៩',
      deliverable_title_english: 'Percentage of students below baseline in Khmer and Math Grade 3 decreases by 5% to 46% in Q1 2025-2026 compared to baseline 51% from Grade 3 standard test 2019',
      timeline: 'ខែតុលា ឆ្នាំ២០២៥- ខែមីនា ឆ្នាំ២០២៦',
      activities_text_type5: '- ជំរុញលោកគ្រូអ្នកគ្រូ ក្នុង​ការប្រើប្រាស់ថ្នាលបឋម ដើម្បីលើកកម្ពស់លទ្ធផលសិក្សារបស់សិស្ស\n- ជំរុញលោកគ្រូអ្នកគ្រូ អនុវត្តការធ្វើតេស្តតាមមេរៀន ប្រចាំខែ ឆមាស ដំណាច់ឆ្នាំនិងអនុវត្តកម្មវិធីបង្រៀនសម្របតាមសមត្ថភាពសិស្សរៀនយឺតតាមរយៈថ្នាលបឋម\n- ជំរុញការអនុវត្តកញ្ចប់សម្ភារៈអំណាន និងគណិតវិទ្យាថ្នាក់ដំបូង\n- អនុវត្តការគាំទ្រគរុកោសល្យ ដើម្បីជួយ និងជំរុញការបង្រៀន និងរៀន',
      options: [
        {
          option_number: 1,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន លើស ៥១% ត្រូវបន្ថយ ១០% នៅឆ្នាំសិក្សា២០២៥-២០២៦',
          option_text_english: 'If baseline > 51%, decrease by 10% in 2025-2026',
          condition_type: 'greater_or_equal',
          baseline_percentage: 51.0,
          target_percentage: 41.0
        },
        {
          option_number: 2,
          option_text_khmer: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ៥១% ត្រូវបន្ថយ មកដល់ ៤៦%',
          option_text_english: 'If baseline = 51%, decrease to 46%',
          condition_type: 'equal',
          baseline_percentage: 51.0,
          target_percentage: 46.0
        },
        {
          option_number: 3,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៤៦% ឬតិចជាងនេះ ត្រូវរក្សា យ៉ាងហោចណាស់ អោយនៅដដែល',
          option_text_english: 'If baseline ≤ 46%, maintain at least the same level',
          condition_type: 'less_than',
          baseline_percentage: 46.0,
          target_percentage: 46.0
        }
      ]
    },
    {
      deliverable_number: 5,
      deliverable_title_khmer: 'ភាគរយសិស្សបឋមសិក្សា ទទួលបាននិទ្ទេស A,B,C លើមុខវិជ្ជាភាសាខ្មែរ និង គណិតវិទ្យាថ្នាក់ទី៣ឡើងដល់ (៣២%) នៅត្រីមាសទី១ ឆ្នាំសិក្សា២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន (២៨%) នៃតេស្តស្តង់ដាថ្នាក់ទី៣ ឆ្នាំ២០១៩',
      deliverable_title_english: 'Percentage of primary students receiving grades A, B, C in Khmer and Math Grade 3 increases to 32% in Q1 2025-2026 compared to baseline 28% from Grade 3 standard test 2019',
      timeline: 'ខែតុលា ឆ្នាំ២០២៥- ខែមីនា ឆ្នាំ២០២៦',
      activities_text_type5: '- ជំរុញលោកគ្រូអ្នកគ្រូ ក្នុង​ការប្រើប្រាស់ថ្នាលបឋម ដើម្បីលើកកម្ពស់លទ្ធផលសិក្សារបស់សិស្ស\n- ជំរុញលោកគ្រូអ្នកគ្រូ អនុវត្តការធ្វើតេស្តតាមមេរៀន ប្រចាំខែ ឆមាស ដំណាច់ឆ្នាំនិងអនុវត្តកម្មវិធីបង្រៀនសម្របតាមសមត្ថភាពសិស្សរៀនយឺតតាមរយៈថ្នាលបឋម\n- ជំរុញការអនុវត្តកញ្ចប់សម្ភារៈអំណាន និងគណិតវិទ្យាថ្នាក់ដំបូង\n- អនុវត្តការគាំទ្រគរុកោសល្យ ដើម្បីជួយ និងជំរុញការបង្រៀន និងរៀន',
      options: [
        {
          option_number: 1,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ទាបជាង ២៨% ត្រូវបង្កើន៤% នៅឆ្នាំសិក្សា២០២៥-២០២៦',
          option_text_english: 'If baseline < 28%, increase by 4% in 2025-2026',
          condition_type: 'less_than',
          baseline_percentage: 28.0,
          target_percentage: 32.0
        },
        {
          option_number: 2,
          option_text_khmer: 'បើទិន្ន័យមូលដ្ឋាន ស្មើ ២៨% ត្រូវបង្កើនដល់ ៣២%',
          option_text_english: 'If baseline = 28%, increase to 32%',
          condition_type: 'equal',
          baseline_percentage: 28.0,
          target_percentage: 32.0
        },
        {
          option_number: 3,
          option_text_khmer: 'បើទិន្នន័យមូលដ្ឋាន ស្មើ ៣២% ឬលើសត្រូវរក្សា យ៉ាងហោចណាស់ អោយនៅដដែល',
          option_text_english: 'If baseline ≥ 32%, maintain at least the same level',
          condition_type: 'greater_or_equal',
          baseline_percentage: 32.0,
          target_percentage: 32.0
        }
      ]
    }
  ];

  // Seed for both Agreement Type 4 and 5
  for (const contractType of [4, 5]) {
    console.log(`📝 Seeding deliverables for Agreement Type ${contractType}...`);

    for (const deliverableData of deliverablesData) {
      const deliverable = await prisma.contract_deliverables.create({
        data: {
          contract_type: contractType,
          deliverable_number: deliverableData.deliverable_number,
          deliverable_title_khmer: deliverableData.deliverable_title_khmer,
          deliverable_title_english: deliverableData.deliverable_title_english,
          timeline: deliverableData.timeline,
          activities_text: contractType === 5 ? deliverableData.activities_text_type5 : null,
          order_index: deliverableData.deliverable_number,
          is_active: true
        }
      });

      console.log(`   ✅ Created deliverable #${deliverable.deliverable_number}: ${deliverable.deliverable_title_khmer.substring(0, 50)}...`);

      // Create options for this deliverable
      for (const optionData of deliverableData.options) {
        await prisma.deliverable_options.create({
          data: {
            deliverable_id: deliverable.id,
            option_number: optionData.option_number,
            option_text_khmer: optionData.option_text_khmer,
            option_text_english: optionData.option_text_english,
            condition_type: optionData.condition_type,
            baseline_percentage: optionData.baseline_percentage,
            target_percentage: optionData.target_percentage,
            order_index: optionData.option_number,
            is_active: true
          }
        });

        console.log(`      ➕ Option ${optionData.option_number}: ${optionData.option_text_khmer.substring(0, 40)}...`);
      }
    }

    console.log(`✅ Completed seeding for Agreement Type ${contractType}\n`);
  }

  // Summary
  const totalDeliverables = await prisma.contract_deliverables.count();
  const totalOptions = await prisma.deliverable_options.count();

  console.log('📊 Seeding Summary:');
  console.log(`   Total Deliverables: ${totalDeliverables}`);
  console.log(`   Total Options: ${totalOptions}`);
  console.log(`   Agreement Types: 4 and 5`);
  console.log(`   Deliverables per type: 5`);
  console.log(`   Options per deliverable: 3`);
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding deliverables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
