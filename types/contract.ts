export interface Contract {
  id?: number
  contract_number: string
  contract_type_id: number
  party_a_name: string
  party_a_position?: string
  party_a_organization?: string
  party_b_name: string
  party_b_position?: string
  party_b_organization?: string
  start_date: Date | string
  end_date: Date | string
  location?: string
  additional_data?: any
  status: 'draft' | 'pending_signature' | 'signed' | 'completed'
  party_a_signature?: string
  party_a_signed_date?: Date | string
  party_b_signature?: string
  party_b_signed_date?: Date | string
  created_by?: string
  created_at?: Date | string
  updated_at?: Date | string
}

export interface ContractType {
  id: number
  type_name_khmer: string
  type_name_english?: string
  template_file?: string
}

export interface ContractField {
  id?: number
  contract_id?: number
  field_name: string
  field_value?: string
  field_type: 'text' | 'number' | 'date' | 'dropdown'
  is_required: boolean
}

export const CONTRACT_TYPES = [
  {
    id: 1,
    type_name_khmer: '១. កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គបស និង គបក',
    type_name_english: '1. Performance Agreement between PMU and PCU',
    fields: [
      { field_name: 'project_name', field_type: 'text', is_required: true },
      { field_name: 'budget', field_type: 'number', is_required: true },
      { field_name: 'activities', field_type: 'text', is_required: true },
    ]
  },
  {
    id: 2,
    type_name_khmer: '២. កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធាន គបក និងប្រធានគម្រោង',
    type_name_english: '2. Performance Agreement between PCU Chief and Project Manager',
    fields: [
      { field_name: 'responsibilities', field_type: 'text', is_required: true },
      { field_name: 'targets', field_type: 'text', is_required: true },
      { field_name: 'evaluation_criteria', field_type: 'text', is_required: true },
    ]
  },
  {
    id: 3,
    type_name_khmer: '៣. កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង និងមន្រ្តីគម្រោងតាមតំបន់',
    type_name_english: '3. Performance Agreement between Project Manager and Regional Officers',
    fields: [
      { field_name: 'region', field_type: 'text', is_required: true },
      { field_name: 'regional_targets', field_type: 'text', is_required: true },
      { field_name: 'reporting_frequency', field_type: 'dropdown', is_required: true },
    ]
  },
  {
    id: 4,
    type_name_khmer: '៤. កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ',
    type_name_english: '4. Performance Agreement between Primary Department and District Education Office',
    default_party_a: {
      name: 'លោកបណ្ឌិត កាន់ ពុទ្ធី',
      position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
      organization: 'នាយកដ្ឋានបឋមសិក្សា'
    },
    fields: [
      { field_name: 'district', field_type: 'text', is_required: true },
      { field_name: 'number_of_schools', field_type: 'number', is_required: true },
      { field_name: 'education_targets', field_type: 'text', is_required: true },
    ]
  },
  {
    id: 5,
    type_name_khmer: '៥. កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងសាលាបឋមសិក្សា',
    type_name_english: '5. Performance Agreement between Primary Department and Primary School',
    default_party_a: {
      name: 'លោកបណ្ឌិត កាន់ ពុទ្ធី',
      position: 'ប្រធាននាយកដ្ឋានបឋមសិក្សា',
      organization: 'នាយកដ្ឋានបឋមសិក្សា'
    },
    fields: [
      { field_name: 'school_name', field_type: 'text', is_required: true },
      { field_name: 'student_count', field_type: 'number', is_required: true },
      { field_name: 'teacher_count', field_type: 'number', is_required: true },
      { field_name: 'performance_targets', field_type: 'text', is_required: true },
    ]
  }
]