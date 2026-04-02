import { useMemo, useState, useEffect } from 'react'
import { Tabs } from 'antd'
import {
  CheckSquareOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CloudServerOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useLocation } from 'react-router-dom'
import TaskManagementPage from './tasks/TaskManagementPage'
import UserManagementPage from './users/UserManagementPage'
import MsuiteAccountPage from './msuite/MsuiteAccountPage'
import KnowledgeNotePage from './knowledge/KnowledgeNotePage'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'

  const tabFromUrl = new URLSearchParams(location.search).get('tab') || 'my-tasks'
  const [activeKey, setActiveKey] = useState(tabFromUrl)

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab') || 'my-tasks'
    setActiveKey(tab)
  }, [location.search])

  const tabItems = useMemo(() => {
    const items = [
      {
        key: 'my-tasks',
        label: (
          <span>
            <CheckSquareOutlined style={{ marginRight: 6 }} />
            Công việc của tôi
          </span>
        ),
        children: <TaskManagementPage mode="my-tasks" />,
      },
    ]
    if (isAdmin) {
      items.push(
        {
          key: 'all-tasks',
          label: (
            <span>
              <AppstoreOutlined style={{ marginRight: 6 }} />
              Tất cả công việc
            </span>
          ),
          children: <TaskManagementPage mode="all-tasks" />,
        },
        {
          key: 'users',
          label: (
            <span>
              <TeamOutlined style={{ marginRight: 6 }} />
              Quản lý người dùng
            </span>
          ),
          children: <UserManagementPage />,
        },
        {
          key: 'msuite',
          label: (
            <span>
              <CloudServerOutlined style={{ marginRight: 6 }} />
              Msuite Account
            </span>
          ),
          children: <MsuiteAccountPage />,
        },
        {
          key: 'knowledge',
          label: (
            <span>
              <ReadOutlined style={{ marginRight: 6 }} />
              Sổ tay kiến thức
            </span>
          ),
          children: <KnowledgeNotePage />,
        },
      )
    }
    return items
  }, [isAdmin])

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 24px' }}>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0' }}
          destroyInactiveTabPane={false}
        />
      </div>
    </div>
  )
}
