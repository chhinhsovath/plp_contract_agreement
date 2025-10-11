'use client'

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step5TermsConditions({ formData, updateFormData }: Props) {
  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">លក្ខខណ្ឌកិច្ចព្រមព្រៀង</h2>
        <p className="text-gray-600">Terms and Conditions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Duration */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            កាលបរិច្ឆេទចាប់ផ្តើម *
          </label>
          <input
            type="date"
            value={formData.contract_start_date}
            onChange={(e) => handleChange('contract_start_date', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block font-khmer font-medium mb-2">
            កាលបរិច្ឆេទបញ្ចប់ *
          </label>
          <input
            type="date"
            value={formData.contract_end_date}
            onChange={(e) => handleChange('contract_end_date', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Reporting Frequency */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ប្រេកង់នៃការរាយការណ៍ *
          </label>
          <select
            value={formData.reporting_frequency}
            onChange={(e) => handleChange('reporting_frequency', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          >
            <option value="monthly">ប្រចាំខែ / Monthly</option>
            <option value="quarterly">ប្រចាំត្រីមាស / Quarterly</option>
            <option value="biannual">ប្រចាំឆមាស / Bi-annually</option>
          </select>
        </div>

        {/* Monitoring Visits */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ចំនួនដងពិនិត្យតាមដាន *
          </label>
          <input
            type="number"
            value={formData.monitoring_visits}
            onChange={(e) => handleChange('monitoring_visits', parseInt(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="mt-6">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.agree_to_terms}
            onChange={(e) => handleChange('agree_to_terms', e.target.checked)}
            className="mt-1 mr-3"
          />
          <span className="font-khmer">
            ខ្ញុំយល់ព្រមលើលក្ខខណ្ឌទាំងអស់នៃកិច្ចព្រមព្រៀងសមិទ្ធកម្មនេះ<br/>
            <span className="text-sm text-gray-600">I agree to all terms and conditions of this performance agreement</span>
          </span>
        </label>
      </div>
    </div>
  )
}
