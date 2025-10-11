'use client'

interface FormData {
  total_budget: number
  bank_account_name: string
  bank_account_number: string
}

interface Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  onNext: () => void
  onPrevious: () => void
}

export default function Step3BudgetBank({ formData, updateFormData, onNext, onPrevious }: Props) {
  const handleNext = () => {
    // Validation
    if (!formData.total_budget || formData.total_budget <= 0) {
      alert('សូមបញ្ចូលថវិកាសរុប / Please enter total budget')
      return
    }
    if (!formData.bank_account_name || !formData.bank_account_number) {
      alert('សូមបញ្ចូលព័ត៌មានគណនីធនាគារ / Please enter bank account information')
      return
    }
    onNext()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 font-khmer">
        ថវិកា និងគណនីធនាគារ / Budget & Bank Account
      </h2>

      {/* Total Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ថវិកាសរុប (ដុល្លារអាមេរិក) / Total Budget (USD) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3 text-gray-500">$</span>
          <input
            type="number"
            value={formData.total_budget || ''}
            onChange={(e) => updateFormData({ total_budget: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
        {formData.total_budget > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            ≈ {formatCurrency(formData.total_budget)} USD
          </p>
        )}
      </div>

      {/* Bank Account Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          ឈ្មោះគណនីធនាគារ / Bank Account Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.bank_account_name}
          onChange={(e) => updateFormData({ bank_account_name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-khmer"
          placeholder="ឧ. មន្ទីរអប់រំខេត្តកណ្តាល"
        />
      </div>

      {/* Bank Account Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-khmer">
          លេខគណនីធនាគារ / Bank Account Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.bank_account_number}
          onChange={(e) => updateFormData({ bank_account_number: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="1234567890"
        />
      </div>

      {/* Bank Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-khmer">
          <strong>ចំណាំ:</strong> គណនីធនាគារនេះនឹងត្រូវប្រើសម្រាប់ការផ្ទេរថវិកាពីនាយកដ្ឋានបឋមសិក្សា
        </p>
        <p className="text-sm text-blue-700 mt-1">
          <strong>Note:</strong> This bank account will be used for budget transfers from the Primary Education Department
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-khmer"
        >
          ថយក្រោយ / Back
        </button>
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
