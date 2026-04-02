import { useEffect } from 'react'
import { Modal, Form, Input, Select, message, Button, Space } from 'antd'
import { MsuiteAccount, MsuiteAccountRequest, MSUITE_COUNTRIES } from '../../types'
import { msuiteAccountService } from '../../services/msuiteAccountService'

interface Props {
  open: boolean
  account?: MsuiteAccount | null
  onClose: () => void
  onSuccess: () => void
}

export default function MsuiteAccountForm({ open, account, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const isEdit = !!account

  useEffect(() => {
    if (open) {
      if (account) {
        form.setFieldsValue({
          country: account.country,
          keyRestore: account.keyRestore ?? '',
          domain: account.domain,
          account: account.account,
          password: account.password,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, account, form])

  const handleSubmit = async (values: MsuiteAccountRequest) => {
    try {
      if (isEdit && account) {
        await msuiteAccountService.update(account.id, values)
        message.success('Cập nhật tài khoản thành công!')
      } else {
        await msuiteAccountService.create(values)
        message.success('Thêm tài khoản thành công!')
      }
      onSuccess()
      onClose()
    } catch {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.')
    }
  }

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa Msuite Account' : 'Thêm Msuite Account'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Vui lòng chọn Country!' }]}
        >
          <Select placeholder="Chọn Country" showSearch>
            {MSUITE_COUNTRIES.map((c) => (
              <Select.Option key={c} value={c}>
                {c}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="keyRestore" label="Key Restore">
          <Input.TextArea
            placeholder="Nhập Key Restore (không bắt buộc)"
            rows={3}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </Form.Item>

        <Form.Item
          name="domain"
          label="Domain"
          rules={[{ required: true, message: 'Vui lòng nhập Domain!' }]}
        >
          <Input placeholder="vd: example.msuite.com" />
        </Form.Item>

        <Form.Item
          name="account"
          label="Account"
          rules={[{ required: true, message: 'Vui lòng nhập Account!' }]}
        >
          <Input placeholder="Nhập tên tài khoản" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
