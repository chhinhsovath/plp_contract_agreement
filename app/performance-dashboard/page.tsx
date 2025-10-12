'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PerformanceDashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [indicators, setIndicators] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, indicatorsRes, partnersRes] = await Promise.all([
        fetch('/api/dashboard/overview'),
        fetch('/api/dashboard/indicators'),
        fetch('/api/dashboard/partners')
      ])

      const overviewData = await overviewRes.json()
      const indicatorsData = await indicatorsRes.json()
      const partnersData = await partnersRes.json()

      if (overviewData.success) setOverview(overviewData.data)
      if (indicatorsData.success) setIndicators(indicatorsData.data)
      if (partnersData.success) setPartners(partnersData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 font-khmer">
            ផ្ទាំងតាមដានសមិទ្ធកម្ម
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Performance Monitoring Dashboard - Academic Year 2025-2026</p>
        </div>

        {/* Overview Cards - Optimized for Tablet/Desktop */}
        {overview && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-khmer">កិច្ចព្រមព្រៀងសកម្ម</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{overview.contracts.active}</p>
                  <p className="text-xs text-gray-500 mt-1">Active Contracts</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-khmer">គោលបំណងសរុប</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{overview.milestones.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Milestones</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-khmer">អត្រាសម្រេច</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {overview.performance.overall_achievement_rate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall Achievement Rate</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-khmer">ភាគីមានហានិភ័យ</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{overview.performance.partners_at_risk}</p>
                  <p className="text-xs text-gray-500 mt-1">Partners at Risk</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Milestones Status - Optimized for Tablet/Desktop */}
        {overview && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-10">
            <h2 className="text-2xl font-bold font-khmer mb-6">ស្ថានភាពគោលបំណង</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{overview.milestones.in_progress}</p>
                <p className="text-sm text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{overview.milestones.completed}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{overview.milestones.delayed}</p>
                <p className="text-sm text-gray-600 mt-1">Delayed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{overview.milestones.not_started}</p>
                <p className="text-sm text-gray-600 mt-1">Not Started</p>
              </div>
            </div>
          </div>
        )}

        {/* Indicator Performance - Optimized for Tablet/Desktop */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-10">
          <h2 className="text-2xl font-bold font-khmer mb-6">សមិទ្ធផលតាមសូចនាករ</h2>
          <div className="space-y-4">
            {indicators.map((indicator) => (
              <div key={indicator.indicator_id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium font-khmer">
                      {indicator.indicator_number}. {indicator.indicator_name_km}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{indicator.indicator_name_en}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-blue-600">{indicator.average_achievement}%</p>
                    <p className="text-xs text-gray-500">Average Achievement</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${indicator.average_achievement}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-600">Partners:</p>
                    <p className="font-medium">{indicator.partners_working_on}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Milestones:</p>
                    <p className="font-medium">{indicator.total_milestones}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">On Track:</p>
                    <p className="font-medium text-green-600">{indicator.on_track_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Completed:</p>
                    <p className="font-medium text-blue-600">{indicator.completed_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Performance Ranking - Optimized for Tablet/Desktop */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold font-khmer mb-6">ចំណាត់ថ្នាក់សមិទ្ធផលភាគីដៃគូ</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Achievement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Milestones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.partner_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{partner.rank}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{partner.partner_name}</p>
                        <p className="text-xs text-gray-500">{partner.contract_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{partner.achievement_rate}%</span>
                        <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${partner.achievement_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-3 h-3 rounded-full inline-block ${getHealthColor(partner.overall_health)}`}></span>
                      <span className="ml-2 text-sm text-gray-600">{partner.overall_health}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.completed_milestones}/{partner.total_milestones}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons - Optimized for Tablet/Desktop */}
        <div className="mt-10 flex gap-6">
          <Link
            href="/partner-agreement/new"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            + បង្កើតកិច្ចព្រមព្រៀងថ្មី / New Agreement
          </Link>
          <button
            onClick={() => fetchDashboardData()}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}
