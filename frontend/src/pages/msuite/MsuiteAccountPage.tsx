import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Space, Typography, Tag, Tooltip,
  Popconfirm, message, Input, Select, Row, Col,
  Card, Statistic, Empty,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, ReloadOutlined, GlobalOutlined,
  KeyOutlined, DatabaseOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { MsuiteAccount, MsuiteCountry, MSUITE_COUNTRIES } from '../../types'
import { msuiteAccountService } from '../../services/msuiteAccountService'
import MsuiteAccountForm from '../../components/msuite/MsuiteAccountForm'

const { Title, Text } = Typography

const COUNTRY_COLORS: Record<MsuiteCountry, string> = {
  MVT: 'blue', NCM: 'cyan', VTB: 'green', VTC: 'lime',
  STL: 'gold', MYT: 'orange', VNM: 'red', VTL: 'volcano',
  VTP: 'purple', VTZ: 'geekblue',
}

export default function MsuiteAccountPage() {
  const [accounts, setAccounts] = useState<MsuiteAccount[]>([])
  const [filtered, setFiltered] = useState<MsuiteAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MsuiteAccount | null>(null)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState<MsuiteCountry | 'ALL'>('ALL')
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await msuiteAccountService.getAll()
      setAccounts(data)
    } catch {
      message.error('Không thể tải danh sách Msuite Account')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let result = [...accounts]
    if (countryFilter !== 'ALL') {
      result = result.filter((a) => a.country === countryFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.domain.toLowerCase().includes(q) ||
          a.account.toLowerCase().includes(q) ||
          (a.keyRestore ?? '').toLowerCase().includes(q),
      )
    }
    setFiltered(result)
  }, [accounts, countryFilter, search])

  const handleDelete = async (id: number) => {
    try {
      await msuiteAccountService.delete(id)
      message.success('Xoá tài khoản thành công!')
      load()
    } catch {
      message.error('Không thể xoá tài khoản')
    }
  }

  const togglePassword = (id: number) =>
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }))

  const stats = {
    total: accounts.length,
    countries: new Set(accounts.map((a) => a.country)).size,
  }

  const columns: ColumnsType<MsuiteAccount> = [
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (country: MsuiteCountry) => (
        <Tag color={COUNTRY_COLORS[country]} style={{ borderRadius: 8, fontWeight: 600 }}>
          {country}
        </Tag>
      ),
      filters: MSUITE_COUNTRIES.map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.country === value,
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      ellipsis: true,
      render: (domain: string) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{domain}</Text>
      ),
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      width: 160,
      render: (account: string) => (
        <Text strong style={{ fontSize: 13 }}>{account}</Text>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      width: 180,
      render: (password: string, record: MsuiteAccount) => (
        <Space size={4}>
          <Text
            style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: showPassword[record.id] ? 0 : 2 }}
          >
            {showPassword[record.id] ? password : '••••••••'}
          </Text>
          <Button
            type="link"
            size="small"
            style={{ padding: '0 4px', fontSize: 12 }}
            onClick={() => togglePassword(record.id)}
          >
            {showPassword[record.id] ? 'Ẩn' : 'Hiện'}
          </Button>
        </Space>
      ),
    },
    {
      title: 'Key Restore',
      dataIndex: 'keyRestore',
      key: 'keyRestore',
      ellipsis: true,
      render: (key: string) =>
        key ? (
          <Tooltip title={key}>
            <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12 }} ellipsis>
              {key.length > 20 ? key.slice(0, 20) + '…' : key}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dayjs(date).format('DD/MM/YYYY')}
        </Text>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, record: MsuiteAccount) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              style={{ color: '#1677ff' }}
              onClick={() => { setEditing(record); setFormOpen(true) }}
            />
          </Tooltip>
          <Popconfirm
            title="Xoá tài khoản"
            description="Bạn có chắc chắn muốn xoá tài khoản này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xoá">
              <Button type="text" icon={<DeleteOutlined />} size="small" style={{ color: '#ff4d4f' }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Msuite Account</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); setFormOpen(true) }}
          style={{ borderRadius: 8 }}
        >
          Thêm tài khoản
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng tài khoản', value: stats.total, icon: <DatabaseOutlined />, color: '#1677ff' },
          { title: 'Số Country', value: stats.countries, icon: <GlobalOutlined />, color: '#722ed1' },
          { title: 'Có Key Restore', value: accounts.filter((a) => a.keyRestore).length, icon: <KeyOutlined />, color: '#52c41a' },
        ].map((s) => (
          <Col xs={8} key={s.title}>
            <Card size="small" style={{ borderRadius: 10, border: `1px solid ${s.color}22` }}
              styles={{ body: { padding: '16px 20px' } }}>
              <Statistic
                title={<span style={{ fontSize: 13 }}>{s.title}</span>}
                value={s.value}
                prefix={<span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm theo domain, account, key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Select
            value={countryFilter}
            onChange={setCountryFilter}
            style={{ width: '100%' }}
          >
            <Select.Option value="ALL">Tất cả Country</Select.Option>
            {MSUITE_COUNTRIES.map((c) => (
              <Select.Option key={c} value={c}>{c}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6}>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ width: '100%', borderRadius: 8 }}>
            Làm mới
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} tài khoản`,
        }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có tài khoản nào" />
          ),
        }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />

      <MsuiteAccountForm
        open={formOpen}
        account={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSuccess={load}
      />
    </div>
  )
}
