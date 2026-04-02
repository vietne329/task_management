import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, message } from 'antd'
import { User, CreateUserRequest, ROLE_LABELS, UserRole } from '../../types'
import { userService } from '../../services/userService'

interface UserFormProps {
  open: boolean
  user?: User | null
  onClose: () => void
  onSuccess: () => void
}

export default function UserForm({ open, user, onClose, onSuccess }: UserFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  useEffect(() => {
    if (open) {
      if (user) {
        form.setFieldsValue({
          username: user.username,
          email: user.email,
          role: user.role,
          password: '',
        })
      } else {
        form.resetFields()
        form.setFieldsValue({ role: 'USER' })
      }
    }
  }, [open, user, form])

  const handleSubmit = async (values: CreateUserRequest) => {
    setLoading(true)
    try {
      if (isEdit && user) {
        await userService.updateUser(user.id, values)
        message.success('Cập nhật người dùng thành công!')
      } else {
        await userService.createUser(values)
        message.success('Tạo người dùng thành công!')
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

  const roleOptions = (Object.keys(ROLE_LABELS) as UserRole[]).map((key) => ({
    value: key,
    label: ROLE_LABELS[key],
  }))

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
            { min: 3, message: 'Tên đăng nhập ít nhất 3 ký tự!' },
            { max: 50, message: 'Tên đăng nhập tối đa 50 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập tên đăng nhập" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input placeholder="Nhập địa chỉ email" />
        </Form.Item>

        <Form.Item
          name="password"
          label={isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
          rules={
            isEdit
              ? [{ min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]
              : [
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' },
                ]
          }
        >
          <Input.Password placeholder={isEdit ? 'Để trống nếu không thay đổi' : 'Nhập mật khẩu'} />
        </Form.Item>

        <Form.Item
          name="role"
          label="Vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
        >
          <Select options={roleOptions} placeholder="Chọn vai trò" />
        </Form.Item>

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
