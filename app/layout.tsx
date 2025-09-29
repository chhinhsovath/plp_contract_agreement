import type { Metadata } from 'next'
import { ConfigProvider } from 'antd'
import khKH from 'antd/locale/km_KH'
import '@ant-design/v5-patch-for-react-19'
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ConfigProvider
          locale={khKH}
          theme={{
            token: {
              fontFamily: "'Hanuman', sans-serif",
              colorPrimary: '#0047AB', // Cambodian flag blue
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#DC143C', // Cambodian flag red
              colorInfo: '#1890ff',
              colorTextBase: '#333333',
              colorBgBase: '#ffffff',
              borderRadius: 8,
              fontSize: 16,
              colorBorder: '#d9d9d9',
            },
            components: {
              Typography: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Button: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Input: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Select: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Card: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Tabs: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Form: {
                fontFamily: "'Hanuman', sans-serif",
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}