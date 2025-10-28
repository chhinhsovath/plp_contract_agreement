import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding 5 Performance Indicators...')

  // Clear existing indicators
  await prisma.indicators.deleteMany()
  console.log('✅ Cleared existing indicators')

  // Indicator 1: Grade 1 Enrollment at Correct Age
  const indicator1 = await prisma.indicators.create({
    data: {
      indicator_code: 'IND-001',
      indicator_number: 1,
      indicator_name_km: 'ភាគរយកុមារចុះឈ្មោះចូលរៀនថ្នាក់ទី១ត្រឹមត្រូវតាមអាយុ',
      indicator_name_en: 'Percentage of children enrolled in Grade 1 at correct age',
      target_percentage: 95,
      baseline_percentage: 93.7,
      is_reduction_target: false,
      implementation_start: '2025-10',
      implementation_end: '2025-11',
      description_km: 'សូចនាករទី១: ភាគរយកុមារចុះឈ្មោះចូលរៀនថ្នាក់ទី១ត្រឹមត្រូវតាមអាយុ (៩៥%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៩៣.៧%',
      description_en: 'Indicator 1: Percentage of children enrolled in Grade 1 at correct age (95%) in academic year 2025-2026 compared to baseline 93.7%',
      calculation_rules: [
        {
          condition: 'baseline < 93.7',
          target_increase: 1.3,
          description_km: 'បើទិន្នន័យមូលដ្ឋានទាបជាង 93.7% ត្រូវបង្កើន 1.3%',
          description_en: 'If baseline < 93.7%, increase by 1.3%'
        },
        {
          condition: 'baseline == 93.7',
          target_increase: 'up_to_95',
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 93.7% ត្រូវបង្កើនដល់ 95%',
          description_en: 'If baseline = 93.7%, reach 95%'
        },
        {
          condition: 'baseline >= 95',
          target_increase: 0,
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 95% ឬលើសត្រូវរក្សាយ៉ាងហោចណាស់អោយនៅដដែល',
          description_en: 'If baseline >= 95%, maintain current level'
        }
      ],
      is_active: true
    }
  })
  console.log('✅ Created Indicator 1: Grade 1 Enrollment')

  // Indicator 2: Schools with Information Boards
  const indicator2 = await prisma.indicators.create({
    data: {
      indicator_code: 'IND-002',
      indicator_number: 2,
      indicator_name_km: 'ភាគរយសាលាបឋមសិក្សាមានបណ្ណព័ត៌មានសាលារៀន',
      indicator_name_en: 'Percentage of primary schools with school information boards',
      target_percentage: 46,
      baseline_percentage: 36,
      is_reduction_target: false,
      implementation_start: '2025-10',
      implementation_end: '2026-02',
      description_km: 'សូចនាករទី២: ភាគរយសាលាបឋមសិក្សាមានបណ្ណព័ត៌មានសាលារៀន (៤៦%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៣៦%',
      description_en: 'Indicator 2: Percentage of primary schools with school information boards (46%) in academic year 2025-2026 compared to baseline 36%',
      calculation_rules: [
        {
          condition: 'baseline < 36',
          target_increase: 10,
          description_km: 'បើទិន្នន័យមូលដ្ឋានទាបជាង 36% ត្រូវបង្កើន 10%',
          description_en: 'If baseline < 36%, increase by 10%'
        },
        {
          condition: 'baseline == 36',
          target_increase: 'up_to_46',
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 36% ត្រូវបង្កើនដល់ 46%',
          description_en: 'If baseline = 36%, reach 46%'
        },
        {
          condition: 'baseline >= 46',
          target_increase: 0,
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 46% ឬលើសត្រូវរក្សាយ៉ាងហោចណាស់អោយនៅដដែល',
          description_en: 'If baseline >= 46%, maintain current level'
        }
      ],
      is_active: true
    }
  })
  console.log('✅ Created Indicator 2: School Information Boards')

  // Indicator 3: Schools with Management Committees
  const indicator3 = await prisma.indicators.create({
    data: {
      indicator_code: 'IND-003',
      indicator_number: 3,
      indicator_name_km: 'ភាគរយសាលារៀនរៀបចំបង្កើតគណៈកម្មការគ្រប់គ្រងសាលារៀន',
      indicator_name_en: 'Percentage of schools establishing school management committees',
      target_percentage: 50,
      baseline_percentage: 30,
      is_reduction_target: false,
      implementation_start: '2025-10',
      implementation_end: '2026-03',
      description_km: 'សូចនាករទី៣: ភាគរយសាលារៀនរៀបចំបង្កើតគណៈកម្មការគ្រប់គ្រងសាលារៀន (៥០%) នៅឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន ៣០%',
      description_en: 'Indicator 3: Percentage of schools establishing school management committees (50%) in academic year 2025-2026 compared to baseline 30%',
      calculation_rules: [
        {
          condition: 'baseline < 30',
          target_increase: 20,
          description_km: 'បើទិន្នន័យមូលដ្ឋានទាបជាង 30% ត្រូវបង្កើន 20%',
          description_en: 'If baseline < 30%, increase by 20%'
        },
        {
          condition: 'baseline == 30',
          target_increase: 'up_to_50',
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 30% ត្រូវបង្កើនដល់ 50%',
          description_en: 'If baseline = 30%, reach 50%'
        },
        {
          condition: 'baseline >= 50',
          target_increase: 0,
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 50% ឬលើសត្រូវរក្សាយ៉ាងហោចណាស់អោយនៅដដែល',
          description_en: 'If baseline >= 50%, maintain current level'
        }
      ],
      is_active: true
    }
  })
  console.log('✅ Created Indicator 3: School Management Committees')

  // Indicator 4: Grade 3 Students Below Baseline (Reduction)
  const indicator4 = await prisma.indicators.create({
    data: {
      indicator_code: 'IND-004',
      indicator_number: 4,
      indicator_name_km: 'ភាគរយសិស្សដែលនៅក្រោមមូលដ្ឋានលើមុខវិជ្ជាភាសាខ្មែរ និងគណិតវិទ្យាថ្នាក់ទី៣ថយចុះ',
      indicator_name_en: 'Percentage decrease of Grade 3 students below baseline in Khmer and Math',
      target_percentage: 46,
      baseline_percentage: 51,
      is_reduction_target: true,
      implementation_start: '2025-10',
      implementation_end: '2026-03',
      description_km: 'សូចនាករទី៤: ភាគរយសិស្សដែលនៅក្រោមមូលដ្ឋានលើមុខវិជ្ជាភាសាខ្មែរ និងគណិតវិទ្យាថ្នាក់ទី៣ថយចុះ ៥% មកនៅ (៤៦%) នៅត្រីមាសទី១ ឆ្នាំសិក្សា ២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន (៥១ %)',
      description_en: 'Indicator 4: Percentage decrease of Grade 3 students below baseline in Khmer and Math by 5% to (46%) in Q1 2025-2026 compared to baseline (51%)',
      calculation_rules: [
        {
          condition: 'baseline > 51',
          target_decrease: 10,
          description_km: 'បើទិន្នន័យមូលដ្ឋានលើស 51% ត្រូវបន្ថយ 10%',
          description_en: 'If baseline > 51%, decrease by 10%'
        },
        {
          condition: 'baseline == 51',
          target_decrease: 'down_to_46',
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 51% ត្រូវបន្ថយមកដល់ 46%',
          description_en: 'If baseline = 51%, reduce to 46%'
        },
        {
          condition: 'baseline <= 46',
          target_decrease: 0,
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 46% ឬតិចជាងនេះ ត្រូវរក្សាយ៉ាងហោចណាស់អោយនៅដដែល',
          description_en: 'If baseline <= 46%, maintain current level'
        }
      ],
      is_active: true
    }
  })
  console.log('✅ Created Indicator 4: Grade 3 Students Below Baseline Reduction')

  // Indicator 5: Grade 3 Students with A, B, C Grades
  const indicator5 = await prisma.indicators.create({
    data: {
      indicator_code: 'IND-005',
      indicator_number: 5,
      indicator_name_km: 'ភាគរយសិស្សបឋមសិក្សាទទួលបាននិទ្ទេស A,B,C លើមុខវិជ្ជាភាសាខ្មែរ និង គណិតវិទ្យាថ្នាក់ទី៣',
      indicator_name_en: 'Percentage of Grade 3 students achieving grades A, B, C in Khmer and Math',
      target_percentage: 32,
      baseline_percentage: 28,
      is_reduction_target: false,
      implementation_start: '2025-10',
      implementation_end: '2026-03',
      description_km: 'សូចនាករទី៥: ភាគរយសិស្សបឋមសិក្សា ទទួលបាននិទ្ទេស A,B,C លើមុខវិជ្ជាភាសាខ្មែរ និង គណិតវិទ្យាថ្នាក់ទី៣ឡើងដល់ (៣២%) នៅត្រីមាសទី១ ឆ្នាំសិក្សា២០២៥-២០២៦ ធៀបនឹងទិន្នន័យមូលដ្ឋាន (២៨%)',
      description_en: 'Indicator 5: Percentage of Grade 3 students achieving grades A, B, C in Khmer and Math reaching (32%) in Q1 2025-2026 compared to baseline (28%)',
      calculation_rules: [
        {
          condition: 'baseline < 28',
          target_increase: 4,
          description_km: 'បើទិន្នន័យមូលដ្ឋានទាបជាង 28% ត្រូវបង្កើន 4%',
          description_en: 'If baseline < 28%, increase by 4%'
        },
        {
          condition: 'baseline == 28',
          target_increase: 'up_to_32',
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 28% ត្រូវបង្កើនដល់ 32%',
          description_en: 'If baseline = 28%, reach 32%'
        },
        {
          condition: 'baseline >= 32',
          target_increase: 0,
          description_km: 'បើទិន្នន័យមូលដ្ឋានស្មើ 32% ឬលើសត្រូវរក្សាយ៉ាងហោចណាស់អោយនៅដដែល',
          description_en: 'If baseline >= 32%, maintain current level'
        }
      ],
      is_active: true
    }
  })
  console.log('✅ Created Indicator 5: Grade 3 Students with A, B, C Grades')

  console.log('🎉 Successfully seeded 5 performance indicators!')
  console.log('📊 Summary:')
  console.log('  - IND-001: Grade 1 Enrollment at Correct Age (95%)')
  console.log('  - IND-002: Schools with Information Boards (46%)')
  console.log('  - IND-003: Schools with Management Committees (50%)')
  console.log('  - IND-004: Grade 3 Below Baseline Reduction (46%)')
  console.log('  - IND-005: Grade 3 Students with A, B, C (32%)')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding indicators:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
