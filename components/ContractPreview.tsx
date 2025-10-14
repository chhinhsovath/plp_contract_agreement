'use client'

import React, { useEffect, useState } from 'react'
import { Contract } from '@/types/contract'
import { Divider, Button, Table, Spin } from 'antd'
import { PrinterOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons'

interface ContractPreviewProps {
  contract: Contract
  contractType: any
  contractId?: number // Optional: to fetch deliverable selections
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, contractType, contractId }) => {
  const [deliverableSelections, setDeliverableSelections] = useState<any[]>([])
  const [loadingDeliverables, setLoadingDeliverables] = useState(false)

  const hasDeliverables = contract.contract_type_id === 4 || contract.contract_type_id === 5

  useEffect(() => {
    if (hasDeliverables && contractId) {
      fetchDeliverableSelections()
    }
  }, [hasDeliverables, contractId])

  const fetchDeliverableSelections = async () => {
    try {
      setLoadingDeliverables(true)
      const response = await fetch(`/api/contracts/deliverables?contractId=${contractId}`)
      const data = await response.json()

      if (data.success) {
        setDeliverableSelections(data.data.selections)
      }
    } catch (error) {
      console.error('Error fetching deliverable selections:', error)
    } finally {
      setLoadingDeliverables(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="contract-preview p-8 bg-white" id="contract-content">
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .contract-preview {
            padding: 20mm;
            font-size: 14pt;
          }
        }
        .font-moul {
          font-family: 'Moul', serif;
        }
      `}</style>

      <div className="text-center mb-6">
        <h1 className="text-xl font-moul mb-1">ព្រះរាជាណាចក្រកម្ពុជា</h1>
        <h2 className="text-base font-moul mb-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
        <h3 className="text-sm font-hanuman mt-2 mb-1">ក្រសួង អប់រំ យុវជន និងកីឡា</h3>
        <h4 className="text-sm font-hanuman">នាយកដ្ឋានបឋមសិក្សា និងមធ្យមសិក្សា</h4>
        <div className="flex justify-center items-center my-3">
          <div className="border-b-2 border-black w-24"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-lg font-bold font-moul mb-2">កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋមសិក្សានិងមធ្យមសិក្សា និងការិយាល័យអប់រំយុវជននិងកីឡា</h2>
        <h3 className="text-base font-hanuman mt-3">{contractType.type_name_khmer}</h3>
        <p className="text-sm text-gray-700 mt-2 font-hanuman">លេខកិច្ចព្រមព្រៀង: {contract.contract_number}</p>
      </div>

      <div className="mb-6">
        <p className="mb-2">
          <strong>រវាង:</strong>
        </p>
        <div className="ml-8 mb-4">
          <p><strong>ភាគី ក:</strong> លោក/លោកស្រី {contract.party_a_name}</p>
          <p className="ml-4">តួនាទី: {contract.party_a_position}</p>
          <p className="ml-4">អង្គភាព: {contract.party_a_organization}</p>
        </div>
        <p className="mb-2">
          <strong>និង:</strong>
        </p>
        <div className="ml-8">
          <p><strong>ភាគី ខ:</strong> លោក/លោកស្រី {contract.party_b_name}</p>
          <p className="ml-4">តួនាទី: {contract.party_b_position}</p>
          <p className="ml-4">អង្គភាព: {contract.party_b_organization}</p>
        </div>
      </div>

      <Divider />

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ១៖ គោលបំណង</h3>
        <p className="ml-8">
          កិច្ចព្រមព្រៀងនេះមានគោលបំណងកំណត់ការទទួលខុសត្រូវ និងកាតព្វកិច្ចរបស់ភាគីទាំងពីរក្នុងការអនុវត្តការងារតាមតួនាទី។
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ២៖ រយៈពេលនៃកិច្ចព្រមព្រៀង</h3>
        <p className="ml-8">
          កិច្ចព្រមព្រៀងនេះមានសុពលភាពចាប់ពីថ្ងៃទី {formatDate(contract.start_date)}
          ដល់ថ្ងៃទី {formatDate(contract.end_date)}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ៣៖ ទីកន្លែង</h3>
        <p className="ml-8">{contract.location}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ៤៖ លក្ខខណ្ឌនិងការទទួលខុសត្រូវ</h3>
        <div className="ml-8 space-y-2">
          <p className="flex"><span className="mr-2 font-bold">៤.១</span> ភាគី ក ត្រូវទទួលខុសត្រូវលើការផ្តល់ការណែនាំ និងការគាំទ្រដល់ភាគី ខ។</p>
          <p className="flex"><span className="mr-2 font-bold">៤.២</span> ភាគី ខ ត្រូវអនុវត្តការងារតាមផែនការដែលបានកំណត់។</p>
          <p className="flex"><span className="mr-2 font-bold">៤.៣</span> ភាគីទាំងពីរត្រូវរាយការណ៍អំពីវឌ្ឍនភាពការងារជាប្រចាំ។</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ៥៖ ការវាយតម្លៃ</h3>
        <div className="ml-8 space-y-2">
          <p className="flex"><span className="mr-2 font-bold">៥.១</span> ការវាយតម្លៃត្រូវធ្វើឡើងប្រចាំត្រីមាស។</p>
          <p className="flex"><span className="mr-2 font-bold">៥.២</span> លទ្ធផលវាយតម្លៃជាមូលដ្ឋានសម្រាប់កែលម្អការអនុវត្ត។</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4 text-lg font-hanuman">មាត្រា ៦៖ ការកែប្រែនិងបញ្ចប់កិច្ចព្រមព្រៀង</h3>
        <div className="ml-8 space-y-2">
          <p className="flex"><span className="mr-2 font-bold">៦.១</span> ការផ្លាស់ប្តូរណាមួយត្រូវធ្វើឡើងដោយការព្រមព្រៀងជាលាយលក្ខណ៍អក្សររវាងភាគីទាំងពីរ។</p>
          <p className="flex"><span className="mr-2 font-bold">៦.២</span> កិច្ចព្រមព្រៀងអាចបញ្ចប់មុនកាលកំណត់ប្រសិនបើមានការព្រមព្រៀងរវាងភាគីទាំងពីរ។</p>
        </div>
      </div>

      {/* Deliverables Table for Agreement Types 4 and 5 */}
      {hasDeliverables && (
        <div className="mb-8">
          <h3 className="font-bold mb-4 text-lg font-hanuman">តារាងសមិទ្ធកម្ម និងសូចនាករ</h3>
          {loadingDeliverables ? (
            <div className="text-center py-8">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
            </div>
          ) : deliverableSelections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 font-hanuman">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left w-12">ល.រ</th>
                    <th className="border border-gray-300 p-3 text-left">សមិទ្ធកម្ម</th>
                    <th className="border border-gray-300 p-3 text-left">សូចនាករ</th>
                    <th className="border border-gray-300 p-3 text-left w-48">ពេលវេលាអនុវត្ត</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverableSelections.map((selection: any) => (
                    <tr key={selection.id}>
                      <td className="border border-gray-300 p-3 text-center">
                        {selection.deliverable.deliverable_number}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {selection.deliverable.deliverable_title_khmer}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-start">
                          <span className="mr-2 font-bold text-blue-600">
                            ជម្រើសទី {selection.selected_option.option_number}:
                          </span>
                          <span>{selection.selected_option.option_text_khmer}</span>
                        </div>
                        {selection.selected_option.baseline_percentage !== null && selection.selected_option.target_percentage !== null && (
                          <div className="mt-2 text-xs text-gray-600 flex gap-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded">
                              មូលដ្ឋាន: {selection.selected_option.baseline_percentage}%
                            </span>
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                              គោលដៅ: {selection.selected_option.target_percentage}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {selection.deliverable.timeline}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">មិនមានទិន្នន័យសមិទ្ធកម្ម</p>
          )}
        </div>
      )}

      <Divider />

      <div className="mt-12">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="mb-2 font-bold">ភាគី ក</p>
            {contract.party_a_signature && (
              <div className="mb-2">
                <img
                  src={contract.party_a_signature}
                  alt="ហត្ថលេខាភាគី ក"
                  className="h-24 mx-auto"
                />
              </div>
            )}
            <p className="mt-4">ឈ្មោះ: {contract.party_a_name}</p>
            <p>ថ្ងៃទី: {contract.party_a_signed_date ? formatDate(contract.party_a_signed_date) : ''}</p>
          </div>
          <div className="text-center">
            <p className="mb-2 font-bold">ភាគី ខ</p>
            {contract.party_b_signature && (
              <div className="mb-2">
                <img
                  src={contract.party_b_signature}
                  alt="ហត្ថលេខាភាគី ខ"
                  className="h-24 mx-auto"
                />
              </div>
            )}
            <p className="mt-4">ឈ្មោះ: {contract.party_b_name}</p>
            <p>ថ្ងៃទី: {contract.party_b_signed_date ? formatDate(contract.party_b_signed_date) : ''}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4 no-print">
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
          បោះពុម្ព
        </Button>
        <Button type="primary" icon={<DownloadOutlined />}>
          ទាញយក PDF
        </Button>
      </div>
    </div>
  )
}

export default ContractPreview