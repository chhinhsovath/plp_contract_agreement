'use client'

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step6Signatures({ formData, updateFormData }: Props) {
  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">ហត្ថលេខា</h2>
        <p className="text-gray-600">Signatures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Representative Name */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ឈ្មោះអ្នកតំណាងភាគីដៃគូ *
          </label>
          <input
            type="text"
            value={formData.partner_representative_name}
            onChange={(e) => handleChange('partner_representative_name', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            តួនាទី *
          </label>
          <input
            type="text"
            value={formData.partner_representative_position}
            onChange={(e) => handleChange('partner_representative_position', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* Signature Date */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            កាលបរិច្ឆេទហត្ថលេខា *
          </label>
          <input
            type="date"
            value={formData.signature_date}
            onChange={(e) => handleChange('signature_date', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Signature Pad Placeholder */}
      <div className="mt-6">
        <label className="block font-khmer font-medium mb-2">
          ហត្ថលេខាភាគីដៃគូ *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">Signature pad will be implemented here</p>
          <p className="text-sm text-gray-400 mt-2">Digital signature functionality</p>
        </div>
      </div>

      {/* Review Summary */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-bold font-khmer text-lg mb-4">ការពិនិត្យឡើងវិញ / Review Summary</h3>
        <div className="space-y-2 text-sm">
          <p><strong>ភាគីដៃគូ:</strong> {formData.partner_name_km || '-'}</p>
          <p><strong>ទីតាំង:</strong> {formData.province}, {formData.district_city}</p>
          <p><strong>សូចនាករដែលបានជ្រើសរើស:</strong> {formData.selected_indicators?.length || 0} សូចនាករ</p>
          <p><strong>រយៈពេល:</strong> {formData.contract_start_date} ដល់ {formData.contract_end_date}</p>
        </div>
      </div>
    </div>
  )
}
