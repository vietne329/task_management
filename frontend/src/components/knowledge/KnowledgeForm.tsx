import { useEffect, useState } from 'react'
import { Modal, Form, Input, Button, Space, AutoComplete, message } from 'antd'
import { KnowledgeNote, KnowledgeNoteRequest } from '../../types'
import { knowledgeService } from '../../services/knowledgeService'

const { TextArea } = Input

interface Props {
  open: boolean
  note?: KnowledgeNote | null
  onClose: () => void
  onSuccess: () => void
}

export default function KnowledgeForm({ open, note, onClose, onSuccess }: Props) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const isEdit = !!note

  useEffect(() => {
    knowledgeService.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      if (note) {
        form.setFieldsValue({
          title: note.title,
          content: note.content,
          category: note.category ?? '',
          tags: note.tags ?? '',
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, note, form])

  const handleSubmit = async (values: KnowledgeNoteRequest) => {
    setLoading(true)
    try {
      const payload: KnowledgeNoteRequest = {
        title: values.title,
        content: values.content,
        category: values.category?.trim() || undefined,
        tags: values.tags?.trim() || undefined,
      }
      if (isEdit && note) {
        await knowledgeService.update(note.id, payload)
        message.success('Cập nhật ghi chú thành công!')
      } else {
        await knowledgeService.create(payload)
        message.success('Thêm ghi chú thành công!')
      }
      onSuccess()
      onClose()
    } catch {
      message.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map((c) => ({ value: c }))

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề ghi chú" maxLength={255} showCount />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item name="category" label="Danh mục">
            <AutoComplete
              options={categoryOptions}
              placeholder="vd: Java, Spring, React, DevOps..."
              filterOption={(input, opt) =>
                (opt?.value ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            extra="Phân cách bằng dấu phẩy, vd: jwt,spring,security"
          >
            <Input placeholder="tag1,tag2,tag3" />
          </Form.Item>
        </div>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
        >
          <TextArea
            placeholder="Nhập nội dung ghi chú..."
            rows={14}
            style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <Space style={{ float: 'right' }}>
            <Button onClick={onClose}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
