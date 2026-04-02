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
  Select,
  Input,
  Row,
  Col,
  Card,
  Statistic,
  Badge,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  Task,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../../types'
import { taskService } from '../../services/taskService'
import TaskForm from '../../components/tasks/TaskForm'

const { Title, Text } = Typography
const { Option } = Select

interface TaskManagementPageProps {
  mode: 'my-tasks' | 'all-tasks'
}

export default function TaskManagementPage({ mode }: TaskManagementPageProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [searchText, setSearchText] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = mode === 'my-tasks'
        ? await taskService.getMyTasks()
        : await taskService.getAllTasks()
      setTasks(data)
    } catch {
      message.error('Không thể tải danh sách công việc')
    } finally {
      setLoading(false)
    }
  }, [mode])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    let filtered = [...tasks]
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }
    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === priorityFilter)
    }
    if (searchText) {
      const lower = searchText.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description?.toLowerCase().includes(lower) ||
          t.assignedTo?.username.toLowerCase().includes(lower),
      )
    }
    setFilteredTasks(filtered)
  }, [tasks, statusFilter, priorityFilter, searchText])

  const handleDelete = async (id: number) => {
    try {
      await taskService.deleteTask(id)
      message.success('Xoá công việc thành công!')
      loadTasks()
    } catch {
      message.error('Không thể xoá công việc')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  }

  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false
    const days = dayjs(dueDate).diff(dayjs(), 'day')
    return days >= 0 && days <= 3
  }

  const isOverdue = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate || status === 'DONE') return false
    return dayjs(dueDate).isBefore(dayjs(), 'day')
  }

  const columns: ColumnsType<Task> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Task) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 14 }}>
            {title}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: record.description }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: TaskStatus) => (
        <Badge
          status={TASK_STATUS_COLORS[status] as 'default' | 'processing' | 'success' | 'error' | 'warning'}
          text={
            <Tag
              color={
                status === 'TODO' ? 'default' : status === 'IN_PROGRESS' ? 'blue' : 'green'
              }
              style={{ borderRadius: 12 }}
            >
              {TASK_STATUS_LABELS[status]}
            </Tag>
          }
        />
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (priority: TaskPriority) => (
        <Tag color={PRIORITY_COLORS[priority]} style={{ borderRadius: 12 }}>
          {PRIORITY_LABELS[priority]}
        </Tag>
      ),
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (dueDate: string, record: Task) => {
        if (!dueDate) return <Text type="secondary">—</Text>
        const overdue = isOverdue(dueDate, record.status)
        const dueSoon = isDueSoon(dueDate)
        return (
          <Text
            style={{
              color: overdue ? '#ff4d4f' : dueSoon ? '#fa8c16' : '#595959',
              fontWeight: overdue || dueSoon ? 600 : 400,
            }}
          >
            {overdue && <ExclamationCircleOutlined style={{ marginRight: 4 }} />}
            {dayjs(dueDate).format('DD/MM/YYYY')}
          </Text>
        )
      },
      sorter: (a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix()
      },
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 140,
      render: (assignedTo: Task['assignedTo']) =>
        assignedTo ? (
          <Tag color="purple" style={{ borderRadius: 12 }}>
            {assignedTo.username}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Tạo bởi',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (createdBy: Task['createdBy']) =>
        createdBy ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {createdBy.username}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
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
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: Task) => (
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
            title="Xoá công việc"
            description="Bạn có chắc chắn muốn xoá công việc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xoá">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ color: '#ff4d4f' }}
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
          {mode === 'my-tasks' ? 'Công việc của tôi' : 'Tất cả công việc'}
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{ borderRadius: 8 }}
        >
          Tạo công việc
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng số', value: stats.total, icon: <FileTextOutlined />, color: '#1677ff' },
          { title: 'Cần làm', value: stats.todo, icon: <ClockCircleOutlined />, color: '#8c8c8c' },
          { title: 'Đang làm', value: stats.inProgress, icon: <ExclamationCircleOutlined />, color: '#1677ff' },
          { title: 'Hoàn thành', value: stats.done, icon: <CheckCircleOutlined />, color: '#52c41a' },
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

      {/* Filters */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={10}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm kiếm công việc..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={12} sm={5}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%', borderRadius: 8 }}
            placeholder="Trạng thái"
          >
            <Option value="ALL">Tất cả trạng thái</Option>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
              <Option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={5}>
          <Select
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: '100%' }}
            placeholder="Ưu tiên"
          >
            <Option value="ALL">Tất cả ưu tiên</Option>
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <Option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTasks}
            style={{ width: '100%', borderRadius: 8 }}
          >
            Làm mới
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} công việc`,
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có công việc nào"
            />
          ),
        }}
        rowClassName={(record) => {
          if (isOverdue(record.dueDate, record.status)) return 'overdue-row'
          return ''
        }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      />

      <TaskForm
        open={formOpen}
        task={editingTask}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        onSuccess={loadTasks}
      />
    </div>
  )
}
