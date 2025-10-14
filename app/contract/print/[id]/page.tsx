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
  const isContractType5 = contractData.contract_type_id === 5
  const partyBTitle = isContractType4 ? 'ប្រធានការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ' : 'នាយកសាលា/នាយករង/នាយកស្រ្តីទី'

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&family=Moul&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Tacteing';
          src: url('/fonts/tacteing.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

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
          font-size: 11pt;
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
          font-family: 'Moul', serif !important;
          font-size: 13pt;
          font-weight: 400;
          line-height: 1.8;
        }

        .header-underline {
          text-decoration: underline;
        }

        .title {
          font-family: 'Moul', serif !important;
          font-size: 16pt;
          font-weight: 400;
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
          font-size: 11pt;
        }

        .implementer-table .label-col {
          width: 33%;
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
          font-size: 11pt;
        }

        .deliverables-table th {
          font-weight: 700;
          text-align: center;
        }

        .deliverables-table .no-col {
          width: 5%;
          text-align: center;
        }

        .deliverables-table .activity-col {
          width: 40%;
        }

        .deliverables-table .deliverable-col {
          width: 45%;
        }

        .deliverables-table .indicator-col {
          width: 35%;
        }

        .deliverables-table .timeline-col {
          width: 15%;
        }

        .section-title {
          font-weight: 700;
          margin-top: 0.5cm;
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }

        .section-content {
          margin-left: 0.5cm;
          margin-bottom: 0.3cm;
          font-size: 11pt;
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
          margin-bottom: 0.3cm;
          font-size: 11pt;
        }

        .signature-line {
          margin-top: 1.5cm;
          font-size: 11pt;
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

        .bank-info-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.3cm;
        }

        .bank-info-table td {
          border: 1px solid #000;
          padding: 8px;
          font-size: 11pt;
        }

        .bank-info-label {
          width: 35%;
          font-weight: 700;
        }

        .centered-text {
          text-align: center;
          margin-top: 1cm;
        }

        .large-khmer {
          font-family: 'Moul', serif !important;
          font-size: 14pt;
          font-weight: 700;
        }

        .header-divider {
          font-family: 'Tacteing', serif;
          font-size: 24pt;
          text-align: center;
          margin: 10px auto;
          line-height: 1;
          color: #000;
        }
      ` }} />

      <button className="no-print print-button" onClick={() => window.print()}>
        ទាញយកជា PDF
      </button>

      <div className="contract-container">
        {/* Page 1 */}
        <div>
          {/* Header */}
          <div className="header">
            <div className="header-line">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="header-line">ជាតិ  សាសនា  ព្រះមហាក្សត្រ</div>
            <div className="header-divider">3</div>
            <div className="header-line">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
            <div className="header-line">នាយកដ្ឋានបឋមសិក្សា</div>
          </div>

          {/* Title */}
          <div className="title">
            កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋមសិក្សា និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ
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
                <td>នាយកដ្ឋានបឋមសិក្សា</td>
                <td>លោកបណ្ឌិត កាន់ ពុទ្ធី</td>
                <td>ប្រធាននាយកដ្ឋានបឋមសិក្សា</td>
              </tr>
              <tr>
                <td>{isContractType4 ? 'ការិយាល័យអប់រំ' : 'សាលាបឋមសិក្សា'}</td>
                <td>{contractData.party_b_name}</td>
                <td>{partyBTitle}</td>
              </tr>
            </tbody>
          </table>

          {/* Intro Text */}
          {isContractType4 ? (
            <div className="intro-text">
              គណៈគ្រប់គ្រង និងបុគ្គលិកអប់រំនៃការិយាល័យអប់រំ{contractData.party_b_organization || '........................................'}ព្រមព្រៀងក្នុងការគាំទ្រ ជំរុញ និងពិនិត្យតាមដានការអនុវត្តរបស់សាលានៅក្រុងស្រុកខណ្ឌរបស់ខ្លួនឯងដើម្បីមានលទ្ធភាពគ្រប់គ្រាន់បំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖
            </div>
          ) : (
            <div className="intro-text">
              សាលាគណៈបឋមសិក្សា{contractData.party_b_organization || '........................................'}ព្រមព្រៀងក្នុងការបំពេញសូចនាករសមិទ្ធកម្មដូចខាងក្រោម៖
            </div>
          )}

          {/* Deliverables Table - Different for Type 4 and Type 5 */}
          {isContractType4 ? (
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
                    <td>({deliverable.deliverable_number}) {deliverable.deliverable_title_khmer}</td>
                    <td>{deliverable.selected_indicator_text}</td>
                    <td>{deliverable.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              {contractData.deliverables.map((deliverable: any, index: number) => (
                <div key={deliverable.deliverable_number}>
                  <div className="section-title" style={{ marginTop: index === 0 ? '0' : '0.5cm' }}>
                    សមិទ្ធិកម្មទី{deliverable.deliverable_number}៖ {deliverable.deliverable_title_khmer}
                  </div>
                  <table className="deliverables-table">
                    <thead>
                      <tr>
                        <th className="no-col">ល.រ</th>
                        <th className="activity-col">សកម្មភាពនាយកសាលាអនុវត្ត</th>
                        <th className="indicator-col">សូចនាករ</th>
                        <th className="timeline-col">ពេលវេលាអនុវត្ត</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="no-col">{deliverable.deliverable_number}.</td>
                        <td>
                          {deliverable.activities_text ? (
                            <div dangerouslySetInnerHTML={{ __html: deliverable.activities_text.replace(/\n/g, '<br/>') }} />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{deliverable.selected_indicator_text}</td>
                        <td>{deliverable.timeline}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}

          {/* Account Information Section - After Deliverables */}
          <div className="section-title" style={{ marginTop: '0.5cm' }}>
            ការលើកទឹកចិត្តសមិទ្ធកម្ម
          </div>

          {isContractType4 ? (
            <>
              <div className="section-content" style={{ marginLeft: 0 }}>
                ១.ថវិកាដែលទទួលបានសរុប៖.......................................
              </div>
              <div className="section-content" style={{ marginLeft: 0 }}>
                ២.ចំនួនដងនៃការផ្តល់៖ ៤ ដង
              </div>
              <div style={{ marginBottom: '0.5cm' }}>
                <div className="section-content" style={{ fontWeight: 700, marginLeft: 0 }}>
                  ៣. លក្ខខណ្ឌដើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖
                </div>
                <div className="section-content">
                  - ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង
                </div>
                <div className="section-content">
                  - លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។
                </div>
              </div>

              <table className="bank-info-table">
                <tbody>
                  <tr>
                    <td className="bank-info-label">ព័ត៌មានគណនីបង្កើតថ្មី</td>
                    <td>
                      <div>២.ចំនួនដងនៃការផ្តល់: ៤ ដង</div>
                      <div>៣. លក្ខខណ្ឌដើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖</div>
                      <div style={{ marginLeft: '0.5cm' }}>- ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង</div>
                      <div style={{ marginLeft: '0.5cm' }}>- លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។</div>
                      <div style={{ fontWeight: 700 }}>៤. ឈ្មោះនិងលេខ គណនី ប្រធានការិយាល័យអប់រំ</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div className="section-content" style={{ marginLeft: 0 }}>
                ១.ថវិកាដែលទទួលបានសរុប៖.......................................
              </div>
              <div className="section-content" style={{ marginLeft: 0 }}>
                ២.ចំនួនដងនៃការផ្តល់៖៤ ដង
              </div>
              <div style={{ marginBottom: '0.5cm' }}>
                <div className="section-content" style={{ fontWeight: 700, marginLeft: 0 }}>
                  ៣. លក្ខខណ្ឌដើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖
                </div>
                <div className="section-content">
                  - ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង
                </div>
                <div className="section-content">
                  - លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។
                </div>
              </div>

              <div className="section-content" style={{ fontWeight: 700, marginLeft: 0 }}>
                ៤.ព័ត៌មានការបើកប្រាក់៖
              </div>
              <div className="section-content">
                ឈ្មោះគណនី៖
              </div>
              <div className="section-content">
                លេខគណនី៖
              </div>

              <table className="bank-info-table">
                <tbody>
                  <tr>
                    <td className="bank-info-label">ព័ត៌មានគណនីបង្កើតថ្មី</td>
                    <td>
                      <div>១.ថវិកាដែលទទួលបានសរុប៖..........................................</div>
                      <div>២.ចំនួនដងនៃការផ្តល់: ៤ ដង</div>
                      <div>៣. លក្ខខណ្ឌដើម្បីទទួលបានថវិកាគាំទ្រសមិទ្ធកម្ម៖</div>
                      <div style={{ marginLeft: '0.5cm' }}>- ការផ្តល់របាយការណ៍សមិទ្ធកម្មរបស់គម្រោង</div>
                      <div style={{ marginLeft: '0.5cm' }}>- លទ្ធផលនៃការវាយតម្លៃសមិទ្ធកម្មរបស់គ.ប.ក.។</div>
                      <div style={{ fontWeight: 700 }}>៤.គិតមានគណនីត្រូវជ្រើស៖</div>
                      <div style={{ marginLeft: '0.5cm' }}>ឈ្មោះគណនី៖</div>
                      <div style={{ marginLeft: '0.5cm' }}>លេខគណនី៖</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Page 2 - Signature Section */}
        <div className="page-break" style={{ marginTop: '1cm' }}>
          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-label">ប្រធាននាយកដ្ឋាន</div>
              <div className="signature-label">ជ.ប្រធានគម្រោង</div>
              <div className="signature-label">ហត្ថលេខានិងឈ្មោះ</div>
              <div className="signature-line">
                ថ្ងៃទី............ ខែ...............ឆ្នាំ............
              </div>
            </div>
            <div className="signature-box">
              <div className="signature-label">
                ហត្ថលេខានិងឈ្មោះ ({isContractType4 ? 'ប្រធានការិយាល័យអប់រំ' : 'នាយកសាលា'})
              </div>
              <div className="signature-line">
                ថ្ងៃទី............ ខែ...............ឆ្នាំ............
              </div>
            </div>
          </div>

          {/* Bottom centered text for Contract Type 5 */}
          {isContractType5 && (
            <div className="centered-text">
              <div className="large-khmer">មូលនិធិសាលាមុត្តុនា</div>
              <div className="large-khmer">ខ ហូលដាលសាលាមុត្តុនា</div>
              <div>បក្សុលសខីងលុណៈ</div>
              <div style={{ marginTop: '0.5cm' }}>
                ស្ថិទី............ ខែ................ឆ្នាំ............<br />
                បក្សុលសខីងលុណៈ : (ប្រធានការិយាល័យអប់រំ)
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
