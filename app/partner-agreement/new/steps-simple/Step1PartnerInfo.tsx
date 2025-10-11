'use client'

interface FormData {
  partner_name_km: string
  partner_name_en: string
  partner_type: string
  location: string
  contact_person_name: string
  contact_person_position: string
  contact_person_phone: string
}

interface Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onNext: () => void
}

export default function Step1PartnerInfo({ formData, updateFormData, onNext }: Props) {
  const handleNext = () => {
    // Validation
    if (!formData.partner_name_km || !formData.location || !formData.contact_person_name) {
      alert('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ / Please fill all required fields')
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 font-khmer">
        ព័ត៌មានភាគីដៃគូ / Partner Information
      </h2>

      {/* Partner Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ប្រភេទភាគីដៃគូ / Partner Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.partner_type}
          onChange={(e) => updateFormData({ partner_type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="education_office">មន្ទីរអប់រំ / District Education Office</option>
          <option value="primary_school">សាលារៀនបឋមសិក្សា / Primary School</option>
        </select>
      </div>

      {/* Partner Name Khmer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ឈ្មោះភាគីដៃគូ (ខ្មែរ) / Partner Name (Khmer) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.partner_name_km}
          onChange={(e) => updateFormData({ partner_name_km: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-khmer"
          placeholder="ឧ. មន្ទីរអប់រំខេត្តកណ្តាល"
        />
      </div>

      {/* Partner Name English */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ឈ្មោះភាគីដៃគូ (អង់គ្លេស) / Partner Name (English)
        </label>
        <input
          type="text"
          value={formData.partner_name_en}
          onChange={(e) => updateFormData({ partner_name_en: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Kandal Provincial Education Office"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ទីតាំង / Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-khmer"
          placeholder="ឧ. ខេត្តកណ្តាល"
        />
      </div>

      {/* Contact Person Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          អ្នកទំនាក់ទំនង / Contact Person <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.contact_person_name}
          onChange={(e) => updateFormData({ contact_person_name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-khmer"
          placeholder="ឈ្មោះអ្នកទំនាក់ទំនង"
        />
      </div>

      {/* Contact Person Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          តំណែង / Position
        </label>
        <input
          type="text"
          value={formData.contact_person_position}
          onChange={(e) => updateFormData({ contact_person_position: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-khmer"
          placeholder="ឧ. នាយក"
        />
      </div>

      {/* Contact Person Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          លេខទូរស័ព្ទ / Phone Number
        </label>
        <input
          type="tel"
          value={formData.contact_person_phone}
          onChange={(e) => updateFormData({ contact_person_phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="077 123 456"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-khmer"
        >
          បន្ទាប់ / Next
        </button>
      </div>
    </div>
  )
}
