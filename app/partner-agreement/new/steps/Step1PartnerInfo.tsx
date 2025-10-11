'use client'

interface Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step1PartnerInfo({ formData, updateFormData }: Props) {
  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-khmer mb-2">ព័ត៌មានភាគីដៃគូ</h2>
        <p className="text-gray-600">Partner Information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner Name KM */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ឈ្មោះការិយាល័យអប់រំ (ខ្មែរ) *
          </label>
          <input
            type="text"
            value={formData.partner_name_km}
            onChange={(e) => handleChange('partner_name_km', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
            placeholder="ឧទាហរណ៍: ការិយាល័យអប់រំក្រុង..."
          />
        </div>

        {/* Partner Name EN */}
        <div>
          <label className="block font-medium mb-2">
            Education Office Name (English) *
          </label>
          <input
            type="text"
            value={formData.partner_name_en}
            onChange={(e) => handleChange('partner_name_en', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., Phnom Penh City Education Office"
          />
        </div>

        {/* Partner Type */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ប្រភេទការិយាល័យ *
          </label>
          <select
            value={formData.partner_type}
            onChange={(e) => handleChange('partner_type', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          >
            <option value="">ជ្រើសរើស...</option>
            <option value="provincial">ការិយាល័យអប់រំខេត្ត / Provincial</option>
            <option value="district">ការិយាល័យអប់រំស្រុក/ក្រុង / District/City</option>
            <option value="khan">ការិយាល័យអប់រំខណ្ឌ / Khan</option>
            <option value="school">សាលាបឋមសិក្សា / Primary School</option>
          </select>
        </div>

        {/* Contact Name */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            អ្នកទំនាក់ទំនង *
          </label>
          <input
            type="text"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* Contact Position */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            តួនាទី *
          </label>
          <input
            type="text"
            value={formData.contact_position}
            onChange={(e) => handleChange('contact_position', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            លេខទូរស័ព្ទ *
          </label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="012345678"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            អ៊ីមែល
          </label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ខេត្ត/រាជធានី *
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* District */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ស្រុក/ក្រុង/ខណ្ឌ *
          </label>
          <input
            type="text"
            value={formData.district_city}
            onChange={(e) => handleChange('district_city', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-khmer"
          />
        </div>

        {/* Total Schools */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ចំនួនសាលារួម *
          </label>
          <input
            type="number"
            value={formData.total_schools}
            onChange={(e) => handleChange('total_schools', parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Total Students */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ចំនួនសិស្សរួម *
          </label>
          <input
            type="number"
            value={formData.total_students}
            onChange={(e) => handleChange('total_students', parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Total Teachers */}
        <div>
          <label className="block font-khmer font-medium mb-2">
            ចំនួនគ្រូរួម *
          </label>
          <input
            type="number"
            value={formData.total_teachers}
            onChange={(e) => handleChange('total_teachers', parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}
