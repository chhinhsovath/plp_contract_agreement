'use client'

import React from 'react'
import { Contract } from '@/types/contract'
import { Divider, Button } from 'antd'
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons'

interface ContractPreviewProps {
  contract: Contract
  contractType: any
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, contractType }) => {
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
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">ព្រះរាជាណាចក្រកម្ពុជា</h1>
        <h2 className="text-xl">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
        <div className="mt-4">
          <div className="inline-block border-b-2 border-black w-32"></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold">កិច្ចព្រមព្រៀងសមិទ្ធកម្ម</h2>
        <h3 className="text-lg mt-2">{contractType.type_name_khmer}</h3>
        <p className="text-sm text-gray-600 mt-2">លេខកិច្ចព្រមព្រៀង: {contract.contract_number}</p>
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
        <h3 className="font-bold mb-4">១. រយៈពេលនៃកិច្ចព្រមព្រៀង</h3>
        <p className="ml-4">
          កិច្ចព្រមព្រៀងនេះមានសុពលភាពចាប់ពីថ្ងៃទី {formatDate(contract.start_date)}
          ដល់ថ្ងៃទី {formatDate(contract.end_date)}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4">២. ទីកន្លែង</h3>
        <p className="ml-4">{contract.location}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-4">៣. លក្ខខណ្ឌនិងការទទួលខុសត្រូវ</h3>
        <div className="ml-4 space-y-2">
          <p>ភាគីទាំងពីរយល់ព្រមអនុវត្តតាមលក្ខខណ្ឌដែលបានកំណត់ក្នុងកិច្ចព្រមព្រៀងនេះ។</p>
          <p>ការផ្លាស់ប្តូរណាមួយត្រូវធ្វើឡើងដោយការព្រមព្រៀងរវាងភាគីទាំងពីរ។</p>
        </div>
      </div>

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