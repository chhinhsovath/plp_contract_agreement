import type { Metadata } from 'next'
import { ConfigProvider, App } from 'antd'
import khKH from 'antd/locale/km_KH'
import '@ant-design/v5-patch-for-react-19'
import './globals.css'

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP',
  description: 'ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសមិទ្ធកម្មសម្រាប់គម្រោង PLP',
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PLP Agreement',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#1890ff',
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
        <link href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100..900&family=Moul&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ConfigProvider
          locale={khKH}
          theme={{
            token: {
              fontFamily: "'Hanuman', sans-serif",
              colorPrimary: '#1890ff',
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#ff4d4f',
              colorInfo: '#1890ff',
              colorTextBase: '#262626',
              colorBgBase: '#ffffff',
              borderRadius: 8,
              fontSize: 15,
              colorBorder: '#d9d9d9',
              controlHeight: 40,
              controlHeightLG: 48,
              controlHeightSM: 32,
              lineWidth: 1,
              lineType: 'solid',
              colorBgContainer: '#ffffff',
              colorBgLayout: '#f0f2f5',
              colorBgElevated: '#ffffff',
              colorText: '#262626',
              colorTextSecondary: '#595959',
              colorTextTertiary: '#8c8c8c',
              colorTextQuaternary: '#bfbfbf',
              colorFill: '#f5f5f5',
              colorFillSecondary: '#fafafa',
              colorFillTertiary: '#f0f0f0',
              colorFillQuaternary: '#e6e6e6',
              colorBgSpotlight: '#ffffff',
              colorBorderSecondary: '#f0f0f0',
              colorSplit: '#f0f0f0',
              colorPrimaryBg: '#e6f7ff',
              colorPrimaryBgHover: '#bae7ff',
              colorPrimaryBorder: '#91d5ff',
              colorPrimaryBorderHover: '#69c0ff',
              colorPrimaryHover: '#40a9ff',
              colorPrimaryActive: '#096dd9',
              colorPrimaryTextHover: '#40a9ff',
              colorPrimaryText: '#1890ff',
              colorPrimaryTextActive: '#096dd9',
              colorSuccessBg: '#f6ffed',
              colorSuccessBorder: '#b7eb8f',
              colorSuccessHover: '#95de64',
              colorSuccessActive: '#389e0d',
              colorSuccessTextHover: '#95de64',
              colorSuccessText: '#52c41a',
              colorSuccessTextActive: '#389e0d',
              colorWarningBg: '#fffbe6',
              colorWarningBorder: '#ffe58f',
              colorWarningHover: '#ffd666',
              colorErrorBg: '#fff2f0',
              colorErrorBorder: '#ffccc7',
              colorErrorHover: '#ff7875',
              colorErrorActive: '#d9363e',
              colorErrorTextHover: '#ff7875',
              colorErrorText: '#ff4d4f',
              colorErrorTextActive: '#d9363e',
              colorInfoBg: '#e6f7ff',
              colorInfoBorder: '#91d5ff',
              colorInfoHover: '#69c0ff',
              colorLink: '#1890ff',
              colorLinkHover: '#40a9ff',
              colorLinkActive: '#096dd9',
              colorHighlight: '#ff4d4f',
              fontSizeHeading1: 38,
              fontSizeHeading2: 30,
              fontSizeHeading3: 24,
              fontSizeHeading4: 20,
              fontSizeHeading5: 16,
              lineHeight: 1.5715,
              lineHeightHeading1: 1.21,
              lineHeightHeading2: 1.27,
              lineHeightHeading3: 1.33,
              lineHeightHeading4: 1.4,
              lineHeightHeading5: 1.5,
              borderRadiusLG: 12,
              borderRadiusSM: 6,
              borderRadiusXS: 4,
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
              Table: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Modal: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Message: {
                fontFamily: "'Hanuman', sans-serif",
              },
              Alert: {
                fontFamily: "'Hanuman', sans-serif",
              },
            },
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
      </body>
    </html>
  )
}