'use client'

import { Menu, Card } from 'antd'
import { TeamOutlined, FileTextOutlined, EditOutlined, HomeOutlined, BellOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import type { MenuProps } from 'antd'

export function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'ទំព័រដើម'
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់'
    },
    {
      key: '/admin/content-management',
      icon: <FileTextOutlined />,
      label: 'គ្រប់គ្រងខ្លឹមសារ'
    },
    {
      key: '/admin/deliverables-management',
      icon: <AppstoreOutlined />,
      label: 'គ្រប់គ្រងសមិទ្ធកម្ម'
    },
    {
      key: '/admin/reconfiguration-requests',
      icon: <BellOutlined />,
      label: 'សំណើផ្លាស់ប្តូរ'
    }
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key)
  }

  return (
    <Card style={{ marginBottom: 24 }}>
      <Menu
        onClick={handleMenuClick}
        selectedKeys={[pathname]}
        mode="horizontal"
        items={menuItems}
        style={{ border: 'none', fontSize: 15 }}
        className="font-hanuman"
      />
    </Card>
  )
}
