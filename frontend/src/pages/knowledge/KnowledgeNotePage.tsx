import { useState, useEffect, useCallback } from 'react'
import {
  Row, Col, Card, Button, Input, Select, Tag, Typography,
  Popconfirm, message, Empty, Tooltip, Modal, Space,
  Statistic, Badge,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  ReloadOutlined, BookOutlined, TagsOutlined, UserOutlined,
  EyeOutlined, FileTextOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { KnowledgeNote } from '../../types'
import { knowledgeService } from '../../services/knowledgeService'
import KnowledgeForm from '../../components/knowledge/KnowledgeForm'

const { Title, Text, Paragraph } = Typography

// Colour palette rotated by hash
const TAG_COLORS = ['blue', 'cyan', 'geekblue', 'green', 'lime', 'magenta', 'orange', 'purple', 'red', 'volcano', 'gold']
const colorFor = (s: string) => TAG_COLORS[Math.abs(s.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length]

export default function KnowledgeNotePage() {
  const [notes, setNotes] = useState<KnowledgeNote[]>([])
  const [filtered, setFiltered] = useState<KnowledgeNote[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<KnowledgeNote | null>(null)
  const [viewing, setViewing] = useState<KnowledgeNote | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [data, cats] = await Promise.all([
        knowledgeService.getAll(),
        knowledgeService.getCategories(),
      ])
      setNotes(data)
      setCategories(cats)
    } catch {
      message.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let result = [...notes]
    if (catFilter !== 'ALL') result = result.filter((n) => n.category === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags ?? '').toLowerCase().includes(q) ||
          (n.category ?? '').toLowerCase().includes(q),
      )
    }
    setFiltered(result)
  }, [notes, catFilter, search])

  const handleDelete = async (id: number) => {
    try {
      await knowledgeService.delete(id)
      message.success('Đã xoá ghi chú!')
      load()
    } catch {
      message.error('Không thể xoá ghi chú')
    }
  }

  const openEdit = (note: KnowledgeNote) => { setEditing(note); setFormOpen(true) }
  const openCreate = () => { setEditing(null); setFormOpen(true) }

  // ── stats ────────────────────────────────────────────────────────────────────
  const totalTags = new Set(
    notes.flatMap((n) => (n.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean)),
  ).size

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Sổ tay kiến thức</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ borderRadius: 8 }}>
          Thêm ghi chú
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Tổng ghi chú', value: notes.length, icon: <FileTextOutlined />, color: '#1677ff' },
          { title: 'Danh mục', value: categories.length, icon: <BookOutlined />, color: '#722ed1' },
          { title: 'Thẻ tag', value: totalTags, icon: <TagsOutlined />, color: '#52c41a' },
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
      <Row gutter={12} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm kiếm tiêu đề, nội dung, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Select value={catFilter} onChange={setCatFilter} style={{ width: '100%' }}>
            <Select.Option value="ALL">Tất cả danh mục</Select.Option>
            {categories.map((c) => (
              <Select.Option key={c} value={c}>{c}</Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6}>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}
            style={{ width: '100%', borderRadius: 8 }}>Làm mới</Button>
        </Col>
      </Row>

      {/* Cards grid */}
      {filtered.length === 0 && !loading ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ghi chú nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((note) => {
            const tagList = (note.tags ?? '')
              .split(',').map((t) => t.trim()).filter(Boolean)

            return (
              <Col xs={24} sm={12} lg={8} key={note.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
                  styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' } }}
                  actions={[
                    <Tooltip title="Xem chi tiết" key="view">
                      <Button type="text" icon={<EyeOutlined />} onClick={() => setViewing(note)} />
                    </Tooltip>,
                    <Tooltip title="Chỉnh sửa" key="edit">
                      <Button type="text" icon={<EditOutlined />} style={{ color: '#1677ff' }}
                        onClick={() => openEdit(note)} />
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="Xoá ghi chú này?"
                      onConfirm={() => handleDelete(note.id)}
                      okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Xoá">
                        <Button type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                >
                  {/* Category badge */}
                  <div style={{ marginBottom: 8 }}>
                    {note.category ? (
                      <Tag color={colorFor(note.category)} style={{ borderRadius: 8, fontSize: 12 }}>
                        <BookOutlined style={{ marginRight: 4 }} />{note.category}
                      </Tag>
                    ) : (
                      <Tag color="default" style={{ borderRadius: 8, fontSize: 12 }}>Chưa phân loại</Tag>
                    )}
                  </div>

                  {/* Title */}
                  <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8, lineHeight: 1.4 }}>
                    {note.title}
                  </Text>

                  {/* Content preview */}
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{ color: '#595959', fontSize: 13, flex: 1, marginBottom: 12 }}
                  >
                    {note.content}
                  </Paragraph>

                  {/* Tags */}
                  {tagList.length > 0 && (
                    <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {tagList.slice(0, 4).map((t) => (
                        <Tag key={t} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>{t}</Tag>
                      ))}
                      {tagList.length > 4 && (
                        <Tag style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>+{tagList.length - 4}</Tag>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <UserOutlined style={{ fontSize: 11, color: '#bfbfbf' }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {note.createdBy?.username ?? '—'}
                      </Text>
                    </Space>
                    <Badge
                      status="default"
                      text={
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {dayjs(note.updatedAt).format('DD/MM/YYYY')}
                        </Text>
                      }
                    />
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* ── Form modal ── */}
      <KnowledgeForm
        open={formOpen}
        note={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSuccess={load}
      />

      {/* ── View detail modal ── */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={
          <Space>
            <Button onClick={() => setViewing(null)}>Đóng</Button>
            <Button type="primary" icon={<EditOutlined />}
              onClick={() => { openEdit(viewing!); setViewing(null) }}>
              Chỉnh sửa
            </Button>
          </Space>
        }
        width={780}
        title={
          <Space>
            {viewing?.category && (
              <Tag color={colorFor(viewing.category)} style={{ borderRadius: 8 }}>
                {viewing.category}
              </Tag>
            )}
            <span>{viewing?.title}</span>
          </Space>
        }
      >
        {viewing && (
          <div>
            {/* Tags */}
            {viewing.tags && (
              <div style={{ marginBottom: 12 }}>
                {viewing.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                  <Tag key={t} style={{ borderRadius: 6, marginBottom: 4 }}>{t}</Tag>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              style={{
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: '16px 20px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.7,
                maxHeight: 480,
                overflowY: 'auto',
              }}
            >
              {viewing.content}
            </div>

            {/* Meta */}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Space size={4}>
                <UserOutlined style={{ color: '#bfbfbf' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {viewing.createdBy?.username ?? '—'}
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cập nhật: {dayjs(viewing.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
