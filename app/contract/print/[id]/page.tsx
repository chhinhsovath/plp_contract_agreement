'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Spin } from 'antd'

export default function ContractPrintPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contractData, setContractData] = useState<any>(null)

  useEffect(() => {
    fetchContractData()
  }, [])

  const fetchContractData = async () => {
    try {
      const response = await fetch(`/api/contracts/print/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContractData(data)
      } else {
        router.push('/me-dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch contract:', error)
      router.push('/me-dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!contractData) {
    return null
  }

  const isContractType4 = contractData.contract_type_id === 4
  const partyBTitle = isContractType4 ? 'ប្រធានការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ' : 'នាយកសាលាបឋមសិក្សា'

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&display=swap');

        @page {
          size: A4;
          margin: 1.5cm 2cm;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page-break {
            page-break-after: always;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Hanuman', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }

        .contract-container {
          max-width: 21cm;
          margin: 0 auto;
          background: white;
          padding: 1cm;
        }

        .header {
          text-align: center;
          margin-bottom: 1cm;
        }

        .header-line {
          font-size: 14pt;
          font-weight: 400;
          line-height: 1.8;
        }

        .title {
          font-size: 16pt;
          font-weight: 700;
          margin: 0.5cm 0;
          text-align: center;
          line-height: 1.8;
        }

        .implementer-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.5cm 0;
        }

        .implementer-table td {
          border: 1px solid #000;
          padding: 8px;
          vertical-align: top;
        }

        .implementer-table .label-col {
          width: 30%;
          font-weight: 700;
        }

        .intro-text {
          margin: 0.5cm 0;
          text-align: justify;
          font-size: 11pt;
          line-height: 1.8;
        }

        .deliverables-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.5cm 0;
        }

        .deliverables-table th,
        .deliverables-table td {
          border: 1px solid #000;
          padding: 8px;
          vertical-align: top;
          text-align: left;
        }

        .deliverables-table th {
          font-weight: 700;
          text-align: center;
          background: #f0f0f0;
        }

        .deliverables-table .no-col {
          width: 8%;
          text-align: center;
        }

        .deliverables-table .deliverable-col {
          width: 50%;
        }

        .deliverables-table .indicator-col {
          width: 25%;
        }

        .deliverables-table .timeline-col {
          width: 17%;
        }

        .incentive-section {
          margin-top: 0.3cm;
          font-weight: 700;
        }

        .signature-section {
          margin-top: 1.5cm;
          display: flex;
          justify-content: space-between;
        }

        .signature-box {
          width: 45%;
          text-align: center;
        }

        .signature-label {
          font-weight: 700;
          margin-bottom: 0.5cm;
        }

        .signature-line {
          margin-top: 1.5cm;
          border-top: 1px solid #000;
          padding-top: 0.2cm;
        }

        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-family: 'Hanuman', serif;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .print-button:hover {
          background: #096dd9;
        }
      `}</style>

      <button className="no-print print-button" onClick={() => window.print()}>
        ទាញយកជា PDF
      </button>

      <div className="contract-container">
        {/* Page 1 */}
        <div>
          {/* Header */}
          <div className="header">
            <div className="header-line">ព្រះរាជាណាចក្ររម្ពុជា</div>
            <div className="header-line">ជាតិ សាសនា ព្រះម្ហាក្សត្រ</div>
            <div className="header-line" style={{ textDecoration: 'underline' }}>ក្រសួងអប់រំ យុវជន និងកីឡា</div>
            <div className="header-line">នាយកដ្ឋានបឋមសិក្សា</div>
          </div>

          {/* Title */}
          <div className="title">
            កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋមសិក្សា និង{isContractType4 ? 'ការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ' : 'សាលាបឋមសិក្សា'}
          </div>

          {/* Implementer Table */}
          <table className="implementer-table">
            <tbody>
              <tr>
                <td className="label-col">អ្នកអនុវត្ត</td>
                <td className="label-col">ឈ្មោះ</td>
                <td className="label-col">មុខតំណែង/តួនាទី</td>
              </tr>
              <tr>
                <td>ប្រធាននាយកដ្ឋានបឋមសិក្សា</td>
                <td>លោកឧត្តមសេនីយ៍ ឯក ពុទ្ធី</td>
                <td>ប្រធាននាយកដ្ឋានបឋមសិក្សា</td>
              </tr>
              <tr>
                <td>{isContractType4 ? 'ប្រធានការិយាល័យអប់រំ' : 'នាយកសាលាបឋមសិក្សា'}</td>
                <td>{contractData.party_b_name}</td>
                <td>{partyBTitle}</td>
              </tr>
            </tbody>
          </table>

          {/* Intro Text */}
          <div className="intro-text">
            គណៈគ្រប់គ្រង និងបុគ្គលិកអប់រំនៃ{isContractType4 ? 'ការិយាល័យអប់រំ' : 'សាលាបឋមសិក្សា'}{contractData.party_b_organization || '........................................'}ប្រព្រឹត្តក្នុងការ{isContractType4 ? 'គាំទ្រ ជំរុញ និងពិនិត្យតាមដានការអនុវត្តរបស់សាលានៅក្រុងស្រុកខណ្ឌរបស់ខ្លួនឯង' : ''}ប្រព្រឹត្តដោយឆនទៈក្នុងការបំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖
          </div>

          {/* Deliverables Table */}
          <table className="deliverables-table">
            <thead>
              <tr>
                <th className="no-col">ល.រ</th>
                <th className="deliverable-col">សមិទ្ធកម្ម</th>
                <th className="indicator-col">សូចនាករ</th>
                <th className="timeline-col">ពេលវេលាអនុវត្ត</th>
              </tr>
            </thead>
            <tbody>
              {contractData.deliverables.map((deliverable: any) => (
                <tr key={deliverable.deliverable_number}>
                  <td className="no-col">{deliverable.deliverable_number}.</td>
                  <td>{deliverable.deliverable_title_khmer}</td>
                  <td>{deliverable.selected_indicator_text}</td>
                  <td>{deliverable.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Incentive Section */}
          <div className="incentive-section">
            ការលើកទឹកចិត្តសមិទ្ធកម្ម
          </div>
          <div style={{ marginTop: '0.2cm' }}>
            ១.ថវិកាដែលទទួលបានសរុប៖.......................................
          </div>
        </div>

        {/* Page 2 */}
        <div className="page-break" style={{ marginTop: '1cm' }}>
          <div style={{ marginBottom: '0.5cm' }}>
            ២.ចំនួនដងនៃការផ្តល់៖.......................................
          </div>
          <div style={{ marginBottom: '1cm' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.3cm' }}>
              ៣. លក្ខខណ្ឌឈ្នើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖
            </div>
            <div style={{ marginLeft: '0.5cm' }}>
              - ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង
            </div>
            <div style={{ marginLeft: '0.5cm' }}>
              - លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។
            </div>
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-label">ប្រធាននាយកដ្ឋាន</div>
              <div className="signature-label">ហត្ថលេខានិងឈ្មោះ</div>
              <div className="signature-line">
                ថ្ងៃទី............ ខែ...............ឆ្នាំ............
              </div>
            </div>
            <div className="signature-box">
              <div className="signature-label">ហត្ថលេខានិងឈ្មោះ ({isContractType4 ? 'ប្រធានការិយាល័យ' : 'នាយកសាលា'})</div>
              <div className="signature-line">
                ថ្ងៃទី............ ខែ...............ឆ្នាំ............
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
