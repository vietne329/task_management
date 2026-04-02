import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message,
} from 'antd'
import dayjs from 'dayjs'
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  User,
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
  TaskStatus,
  TaskPriority,
} from '../../types'
import { taskService } from '../../services/taskService'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../store/authStore'

const { TextArea } = Input
const { Option } = Select

interface TaskFormProps {
  open: boolean
  task?: Task | null
  onClose: () => void
  onSuccess: () => void
}

export default function TaskForm({ open, task, onClose, onSuccess }: TaskFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const { isAdmin } = useAuthStore()
  const isEdit = !!task

  useEffect(() => {
    if (open) {
      loadUsers()
      if (task) {
        form.setFieldsValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? dayjs(task.dueDate) : null,
          assignedToId: task.assignedTo?.id,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          status: 'TODO',
          priority: 'MEDIUM',
        })
      }
    }
  }, [open, task, form])

  const loadUsers = async () => {
    try {
      if (isAdmin()) {
        const data = await userService.getAllUsers()
        setUsers(data)
      }
    } catch {
      // Users list is optional
    }
  }

  const handleSubmit = async (values: {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    dueDate?: dayjs.Dayjs
    assignedToId?: number
  }) => {
    setLoading(true)
    try {
      const payload: CreateTaskRequest | UpdateTaskRequest = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
        assignedToId: values.assignedToId,
      }

      if (isEdit && task) {
        await taskService.updateTask(task.id, payload as UpdateTaskRequest)
        message.success('Cập nhật công việc thành công!')
      } else {
        await taskService.createTask(payload as CreateTaskRequest)
        message.success('Tạo công việc thành công!')
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      message.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((key) => ({
    value: key,
    label: TASK_STATUS_LABELS[key],
  }))

  const priorityOptions = (Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((key) => ({
    value: key,
    label: PRIORITY_LABELS[key],
  }))

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề công việc" maxLength={200} showCount />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <TextArea
            placeholder="Nhập mô tả công việc"
            rows={3}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select options={statusOptions} placeholder="Chọn trạng thái" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Ưu tiên"
            rules={[{ required: true }]}
          >
            <Select options={priorityOptions} placeholder="Chọn mức độ ưu tiên" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item name="dueDate" label="Hạn hoàn thành">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          {isAdmin() && (
            <Form.Item name="assignedToId" label="Giao cho">
              <Select placeholder="Chọn người thực hiện" allowClear>
                {users.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
