import type { Metadata } from 'next'
import { ConfigProvider } from 'antd'
import khKH from 'antd/locale/km_KH'
import './globals.css'

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP',
  description: 'ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសមិទ្ធកម្មសម្រាប់គម្រោង PLP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="km">
      <body>
        <ConfigProvider
          locale={khKH}
          theme={{
            token: {
              fontFamily: "'Noto Sans Khmer', 'Khmer OS', sans-serif",
              colorPrimary: '#1890ff',
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}