import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Tooltip,
  Popconfirm,
  message,
  Input,
  Switch,
  Avatar,
  Badge,
  Empty,
  Row,
  Col,
  Card,
  Statistic,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { User, ROLE_LABELS } from '../../types'
import { userService } from '../../services/userService'
import UserForm from '../../components/users/UserForm'
import { useAuthStore } from '../../store/authStore'

const { Title, Text } = Typography

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchText, setSearchText] = useState('')
  const { user: currentUser } = useAuthStore()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch {
      message.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (!searchText) {
      setFilteredUsers(users)
      return
    }
    const lower = searchText.toLowerCase()
    setFilteredUsers(
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower),
      ),
    )
  }, [users, searchText])

  const handleDelete = async (id: number) => {
    if (id === currentUser?.userId) {
      message.warning('Không thể xoá tài khoản đang đăng nhập!')
      return
    }
    try {
      await userService.deleteUser(id)
      message.success('Xoá người dùng thành công!')
      loadUsers()
    } catch {
      message.error('Không thể xoá người dùng')
    }
  }

  const handleToggleStatus = async (id: number, currentEnabled: boolean) => {
    if (id === currentUser?.userId) {
      message.warning('Không thể thay đổi trạng thái tài khoản đang đăng nhập!')
      return
    }
    try {
      await userService.toggleUserStatus(id)
      message.success(`${currentEnabled ? 'Vô hiệu hoá' : 'Kích hoạt'} tài khoản thành công!`)
      loadUsers()
    } catch {
      message.error('Không thể thay đổi trạng thái tài khoản')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    active: users.filter((u) => u.enabled).length,
    inactive: users.filter((u) => !u.enabled).length,
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: unknown, record: User) => (
        <Space>
          <Avatar
            style={{
              background:
                record.role === 'ADMIN'
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'linear-gradient(135deg, #43e97b, #38f9d7)',
              fontWeight: 600,
            }}
          >
            {record.username[0].toUpperCase()}
          </Avatar>
          <div>
            <Space size={4}>
              <Text strong>{record.username}</Text>
              {record.id === currentUser?.userId && (
                <Tag color="blue" style={{ fontSize: 11, borderRadius: 8 }}>
                  Bạn
                </Tag>
              )}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role: User['role']) => (
        <Tag
          color={role === 'ADMIN' ? 'purple' : 'blue'}
          icon={role === 'ADMIN' ? <UserOutlined /> : <TeamOutlined />}
          style={{ borderRadius: 12 }}
        >
          {ROLE_LABELS[role]}
        </Tag>
      ),
      filters: [
        { text: 'Quản trị viên', value: 'ADMIN' },
        { text: 'Người dùng', value: 'USER' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 130,
      render: (enabled: boolean, record: User) => (
        <Space>
          <Switch
            checked={enabled}
            size="small"
            onChange={() => handleToggleStatus(record.id, enabled)}
            disabled={record.id === currentUser?.userId}
          />
          <Badge
            status={enabled ? 'success' : 'default'}
            text={
              <Text style={{ fontSize: 13, color: enabled ? '#52c41a' : '#8c8c8c' }}>
                {enabled ? 'Hoạt động' : 'Vô hiệu'}
              </Text>
            }
          />
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: User) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              style={{ color: '#1677ff' }}
            />
          </Tooltip>
          <Popconfirm
            title="Xoá người dùng"
            description="Bạn có chắc chắn muốn xoá người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            disabled={record.id === currentUser?.userId}
          >
            <Tooltip title={record.id === currentUser?.userId ? 'Không thể xoá tài khoản của bạn' : 'Xoá'}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{
                  color: record.id === currentUser?.userId ? '#d9d9d9' : '#ff4d4f',
                }}
                disabled={record.id === currentUser?.userId}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Quản lý người dùng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{ borderRadius: 8 }}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng số', value: stats.total, icon: <TeamOutlined />, color: '#1677ff' },
          { title: 'Quản trị viên', value: stats.admins, icon: <UserOutlined />, color: '#722ed1' },
          { title: 'Hoạt động', value: stats.active, icon: <CheckCircleOutlined />, color: '#52c41a' },
          { title: 'Vô hiệu', value: stats.inactive, icon: <StopOutlined />, color: '#8c8c8c' },
        ].map((stat) => (
          <Col xs={12} sm={6} key={stat.title}>
            <Card
              size="small"
              style={{ borderRadius: 10, border: `1px solid ${stat.color}22` }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Statistic
                title={<span style={{ fontSize: 13 }}>{stat.title}</span>}
                value={stat.value}
                prefix={<span style={{ color: stat.color, fontSize: 16 }}>{stat.icon}</span>}
                valueStyle={{ color: stat.color, fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm kiếm người dùng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={24} sm={4}>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadUsers}
            style={{ width: '100%', borderRadius: 8 }}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} người dùng`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có người dùng nào"
            />
          ),
        }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />

      <UserForm
        open={formOpen}
        user={editingUser}
        onClose={() => {
          setFormOpen(false)
          setEditingUser(null)
        }}
        onSuccess={loadUsers}
      />
    </div>
  )
}
