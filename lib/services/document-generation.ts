/**
 * DOCX Contract Document Generation Service
 *
 * Generates official contract documents from templates 4 & 5
 * Based on PRD: contract_template_mapping.json
 */

import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ContractData {
  contract_number: string
  academic_year: string

  // Party A (Department)
  party_a_name: string
  party_a_position: string
  party_a_representative: string

  // Party B (Partner)
  party_b_name: string
  party_b_position: string
  party_b_representative: string
  party_b_location: string

  // Selected Indicators with Targets
  indicators: Array<{
    indicator_number: number
    indicator_name_km: string
    baseline_percentage: number
    target_percentage: number
    implementation_period: string
    calculation_rule_km: string
  }>

  // Budget and Incentives
  total_budget?: number
  disbursement_count: number
  bank_account_name?: string
  bank_account_number?: string

  // Signatures
  signature_date: string
}

export class DocumentGenerator {
  private templatePath: string

  constructor(templateType: 'template_4' | 'template_5') {
    // Path to template files
    const templateFileName = templateType === 'template_4'
      ? 'contract_template_4.docx'
      : 'contract_template_5.docx'

    this.templatePath = join(process.cwd(), 'public', 'templates', templateFileName)
  }

  /**
   * Generate contract document from template
   */
  async generateDocument(data: ContractData): Promise<Buffer> {
    try {
      // Load template
      const content = readFileSync(this.templatePath, 'binary')
      const zip = new PizZip(content)

      // Initialize docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      // Set template data
      doc.setData({
        // Header
        country_km: 'ព្រះរាជាណាចក្រកម្ពុជា',
        motto_km: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
        ministry_km: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
        department_km: 'នាយកដ្ឋានបឋមសិក្សា',

        // Contract Info
        contract_number: data.contract_number,
        academic_year: data.academic_year,

        // Party A
        party_a_name: data.party_a_name,
        party_a_position: data.party_a_position,
        party_a_representative: data.party_a_representative,

        // Party B
        party_b_name: data.party_b_name,
        party_b_position: data.party_b_position,
        party_b_representative: data.party_b_representative,
        party_b_location: data.party_b_location,

        // Indicators (loop in template)
        indicators: data.indicators,

        // Budget
        total_budget: data.total_budget || 0,
        disbursement_count: data.disbursement_count,
        bank_account_name: data.bank_account_name || '',
        bank_account_number: data.bank_account_number || '',

        // Signatures
        signature_date: data.signature_date,
        current_date: new Date().toLocaleDateString('km-KH')
      })

      // Render the document
      doc.render()

      // Get the generated document as buffer
      const buffer = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE'
      })

      return buffer
    } catch (error: any) {
      console.error('Error generating document:', error)
      throw new Error(`Document generation failed: ${error.message}`)
    }
  }

  /**
   * Save document to file
   */
  async saveDocument(data: ContractData, outputPath: string): Promise<string> {
    const buffer = await this.generateDocument(data)
    writeFileSync(outputPath, buffer)
    return outputPath
  }

  /**
   * Generate contract from database record
   */
  static async generateFromContract(contractId: number, templateType: 'template_4' | 'template_5'): Promise<Buffer> {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Fetch contract with all relations
      const contract = await prisma.contracts.findUnique({
        where: { id: contractId },
        include: {
          contract_type: true,
          contract_indicators: {
            include: {
              indicator: true
            }
          }
        }
      })

      if (!contract) {
        throw new Error(`Contract ${contractId} not found`)
      }

      // Map contract data to template format
      const contractData: ContractData = {
        contract_number: contract.contract_number,
        academic_year: '2025-2026',

        party_a_name: contract.party_a_name,
        party_a_position: contract.party_a_position || 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
        party_a_representative: 'លោកបណ្ឌិត កាន់ ពុទ្ធី',

        party_b_name: contract.party_b_name,
        party_b_position: contract.party_b_position || '',
        party_b_representative: contract.party_b_name,
        party_b_location: contract.location || '',

        indicators: contract.contract_indicators.map((ci, index) => {
          const indicator = ci.indicator
          const increase = ci.target_percentage - ci.baseline_percentage

          let calculationRule = ''
          if (indicator.is_reduction_target) {
            calculationRule = `បន្ថយពី ${ci.baseline_percentage}% មក ${ci.target_percentage}% (-${Math.abs(increase).toFixed(1)}%)`
          } else {
            calculationRule = `បង្កើនពី ${ci.baseline_percentage}% ដល់ ${ci.target_percentage}% (+${increase.toFixed(1)}%)`
          }

          return {
            indicator_number: indicator.indicator_number,
            indicator_name_km: indicator.indicator_name_km,
            baseline_percentage: ci.baseline_percentage,
            target_percentage: ci.target_percentage,
            implementation_period: `${indicator.implementation_start} - ${indicator.implementation_end}`,
            calculation_rule_km: calculationRule
          }
        }),

        disbursement_count: 4,
        signature_date: new Date().toLocaleDateString('km-KH')
      }

      const generator = new DocumentGenerator(templateType)
      return await generator.generateDocument(contractData)
    } finally {
      await prisma.$disconnect()
    }
  }
}

/**
 * Helper function to convert contract type ID to template type
 */
export function getTemplateType(contractTypeId: number): 'template_4' | 'template_5' {
  // Template 4: Education offices (contract_type_id = 4)
  // Template 5: Primary schools (contract_type_id = 5)
  return contractTypeId === 5 ? 'template_5' : 'template_4'
}
