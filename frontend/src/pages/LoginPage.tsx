import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { LoginRequest } from '../types'
import { AxiosError } from 'axios'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (values: LoginRequest) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.login(values)
      login(response)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(
        axiosError.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          border: 'none',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: '40px 40px 32px' } }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginBottom: 16,
            }}
          >
            <ThunderboltOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Title level={2} style={{ margin: 0, color: '#1a1a2e', fontWeight: 700 }}>
            Task Manager
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý công việc hiệu quả
          </Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 20, borderRadius: 8 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tên đăng nhập"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Mật khẩu"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        {/* Demo credentials hint */}
        {/* <div
          style={{
            background: '#f8f9ff',
            borderRadius: 8,
            padding: '12px 16px',
            border: '1px solid #e8ecff',
          }}
        > */}
          {/* <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
            Tài khoản demo:
          </Text>
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: 12 }}>
              Admin: <Text code>admin</Text> / <Text code>admin123</Text>
            </Text>
            <Text style={{ fontSize: 12 }}>
              User: <Text code>user1</Text> / <Text code>user123</Text>
            </Text>
          </Space> */}
        {/* </div> */}
      </Card>
    </div>
  )
}
