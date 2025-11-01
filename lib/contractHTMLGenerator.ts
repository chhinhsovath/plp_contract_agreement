/**
 * Convert contract JSON data to beautifully formatted HTML
 * This creates a clean, editable document like WordPress
 */

export function generateContractHTML(contractData: any): string {
  const isType4 = contractData.contract_type_id === 4
  const isType5 = contractData.contract_type_id === 5

  return `
    <div style="font-family: 'Hanuman', serif; font-size: 11pt; line-height: 1.6; max-width: 800px; margin: 0 auto;">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 1cm;">
        <p style="font-weight: bold; margin: 4px 0;">ព្រះរាជាណាចក្រកម្ពុជា</p>
        <p style="font-weight: bold; margin: 4px 0;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
        <p style="font-size: 24pt; margin: 10px 0;">3</p>
        <p style="margin: 4px 0;">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
        <p style="margin: 4px 0;">នាយកដ្ឋានបឋមសិក្សា</p>
      </div>

      <!-- Title -->
      <h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin: 1cm 0;">
        ${contractData.contract_type_name || 'កិច្ចព្រមព្រៀងសមិទ្ធកម្ម'}
      </h1>

      <!-- Contract Number -->
      <p style="text-align: center; margin-bottom: 0.5cm;">
        លេខកិច្ចសន្យា: <strong>${contractData.contract_number}</strong>
      </p>

      <!-- Parties Table -->
      <h3 style="font-weight: bold; margin-top: 0.5cm;">អ្នកអនុវត្ត ឬអ្នកទទួលខុសត្រូវ និងគណៈកម្មាធិការគ្រប់គ្រងសាលារៀន</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 0.5cm 0;" border="1">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 8px; text-align: left;">អ្នកអនុវត្ត</th>
            <th style="padding: 8px; text-align: left;">ឈ្មោះ</th>
            <th style="padding: 8px; text-align: left;">មុខតំណែង/ឋានៈ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px;">${contractData.party_a_name || 'នាយកដ្ឋានបឋមសិក្សា'}</td>
            <td style="padding: 8px;">លោកបណ្ឌិត កាន់ ពុទ្ធី</td>
            <td style="padding: 8px;">ប្រធាននាយកដ្ឋានបឋមសិក្សា</td>
          </tr>
          <tr>
            <td style="padding: 8px;">${isType4 ? 'ការិយាល័យអប់រំ' : 'សាលាបឋមសិក្សា'}</td>
            <td style="padding: 8px;"><strong>${contractData.party_b_name}</strong></td>
            <td style="padding: 8px;">${contractData.party_b_position || (isType4 ? 'ប្រធានការិយាល័យអប់រំ' : 'នាយកសាលា')}</td>
          </tr>
        </tbody>
      </table>

      <!-- Introduction -->
      <p style="margin: 0.5cm 0; text-indent: 1cm;">
        ${isType4
          ? `គណៈគ្រប់គ្រង និងបុគ្គលិកអប់រំនៃការិយាល័យអប់រំ<strong>${contractData.party_b_organization || '........................................'}</strong>ព្រមព្រៀងក្នុងការគាំទ្រ ជំរុញ និងពិនិត្យតាមដានការអនុវត្តរបស់សាលានៅក្រុងស្រុកខណ្ឌរបស់ខ្លួនឯងដើម្បីមានលទ្ធភាពគ្រប់គ្រាន់បំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖`
          : `សាលាគណៈបឋមសិក្សា<strong>${contractData.party_b_organization || '........................................'}</strong>ព្រមព្រៀងក្នុងការបំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖`
        }
      </p>

      <!-- Deliverables Table -->
      <h3 style="font-weight: bold; margin-top: 0.5cm;">សមិទ្ធកម្ម</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 0.5cm 0;" border="1">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 6px; width: 5%;">ល.រ</th>
            <th style="padding: 6px; width: 45%;">សមិទ្ធកម្ម</th>
            <th style="padding: 6px; width: 30%;">សូចនាករ</th>
            <th style="padding: 6px; width: 20%;">ពេលវេលាអនុវត្ត</th>
          </tr>
        </thead>
        <tbody>
          ${contractData.deliverables?.map((d: any, i: number) => `
            <tr>
              <td style="padding: 6px; text-align: center;">${d.deliverable_number}.</td>
              <td style="padding: 6px;">(${d.deliverable_number}) ${d.deliverable_title_khmer}</td>
              <td style="padding: 6px;">${d.selected_indicator_text}</td>
              <td style="padding: 6px;">${d.timeline}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>

      <!-- Indicators Table -->
      <h3 style="font-weight: bold; margin-top: 0.5cm;">សូចនាករលម្អិត</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 0.5cm 0;" border="1">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 6px;">កូដ</th>
            <th style="padding: 6px;">សូចនាករ</th>
            <th style="padding: 6px;">មូលដ្ឋាន</th>
            <th style="padding: 6px;">គោលដៅ</th>
          </tr>
        </thead>
        <tbody>
          ${contractData.indicators?.map((ind: any) => `
            <tr>
              <td style="padding: 6px;">${ind.indicator_code}</td>
              <td style="padding: 6px;">${ind.indicator_name_km}</td>
              <td style="padding: 6px; text-align: center;">${ind.baseline_percentage}%</td>
              <td style="padding: 6px; text-align: center;">${ind.target_percentage}%</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>

      <!-- Signatures -->
      <div style="margin-top: 1.5cm; display: flex; justify-content: space-between;">
        <div style="text-align: center; flex: 1;">
          <p style="font-weight: bold;">ជ.ប្រធានគម្រោង</p>
          <p style="font-weight: bold;">ប្រធាននាយកដ្ឋាន</p>
          <div style="height: 3cm; display: flex; align-items: center; justify-content: center;">
            ${contractData.party_a_signature && !contractData.party_a_signature.includes('PLACEHOLDER')
              ? `<img src="${contractData.party_a_signature}" alt="Party A Signature" style="max-height: 2.5cm; max-width: 100%;" />`
              : '<div style="height: 2.5cm;"></div>'}
          </div>
          <p style="font-weight: 400;">ហត្ថលេខានិងឈ្មោះ</p>
          ${contractData.party_a_signed_date ? `
            <p style="font-size: 10pt; margin-top: 0.2cm;">
              ${new Date(contractData.party_a_signed_date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          ` : ''}
        </div>

        <div style="text-align: center; flex: 1;">
          <p>ថ្ងៃទី............ ខែ...............ឆ្នាំ............</p>
          <div style="height: 3cm; display: flex; align-items: center; justify-content: center;">
            ${contractData.party_b_signature
              ? `<img src="${contractData.party_b_signature}" alt="Party B Signature" style="max-height: 2.5cm; max-width: 100%;" />`
              : '<div style="height: 2.5cm;"></div>'}
          </div>
          <p style="font-weight: 400;">ហត្ថលេខានិងឈ្មោះ (${isType4 ? 'ប្រធានការិយាល័យអប់រំ' : 'នាយកសាលា'})</p>
          ${contractData.party_b_signed_date ? `
            <p style="font-size: 10pt; margin-top: 0.2cm;">
              ${new Date(contractData.party_b_signed_date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          ` : ''}
        </div>
      </div>

    </div>
  `
}

/**
 * Parse HTML back to update contract data
 * Extract key information from edited HTML
 */
export function parseContractHTML(html: string): Partial<any> {
  // This would extract data from HTML if needed
  // For now, we store the HTML as-is for display
  return {
    contract_html: html
  }
}
