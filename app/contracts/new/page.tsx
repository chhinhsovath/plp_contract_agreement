'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'

export default function NewContractRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the home page where users can select contract type
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" tip="កំពុងបញ្ជូនទៅទំព័រដើម..." />
    </div>
  )
}