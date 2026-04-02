import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Badge, theme } from 'antd'
import {
  DashboardOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  // Determine which sidebar key is active based on URL hash/search
  const getSelectedKey = () => {
    const tab = new URLSearchParams(location.search).get('tab')
    if (tab === 'users') return 'users'
    if (tab === 'all-tasks') return 'all-tasks'
    if (tab === 'msuite') return 'msuite'
    if (tab === 'knowledge') return 'knowledge'
    return 'dashboard'
  }

  const handleLogout = async () => {
    await authService.logout()
    logout()
    navigate('/login', { replace: true })
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{user?.username}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ]

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Công việc của tôi',
      onClick: () => navigate('/dashboard?tab=my-tasks'),
    },
    ...(isAdmin
      ? [
          {
            key: 'all-tasks',
            icon: <CheckSquareOutlined />,
            label: 'Tất cả công việc',
            onClick: () => navigate('/dashboard?tab=all-tasks'),
          },
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate('/dashboard?tab=users'),
          },
          {
            key: 'msuite',
            icon: <CloudServerOutlined />,
            label: 'Msuite Account',
            onClick: () => navigate('/dashboard?tab=msuite'),
          },
          {
            key: 'knowledge',
            icon: <ReadOutlined />,
            label: 'Sổ tay kiến thức',
            onClick: () => navigate('/dashboard?tab=knowledge'),
          },
        ]
      : []),
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
        width={220}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ThunderboltOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          {!collapsed && (
            <Text
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                whiteSpace: 'nowrap',
              }}
            >
              Task Manager
            </Text>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 8,
          }}
          theme="dark"
        />

        {/* User info at bottom */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <Space>
              <Avatar
                size={32}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <div style={{ overflow: 'hidden' }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'block',
                    lineHeight: '18px',
                  }}
                >
                  {user?.username}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: '16px' }}>
                  {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{ cursor: 'pointer', fontSize: 18, color: token.colorTextSecondary }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Space size={16}>
            <Badge count={0} showZero={false}>
              <BellOutlined style={{ fontSize: 18, color: token.colorTextSecondary, cursor: 'pointer' }} />
            </Badge>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                  </div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
