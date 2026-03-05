import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'; // Dùng Mail icon
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/login', {
        email: values.email, // Gửi email
        password: values.password
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      message.success('Đăng nhập thành công');
      navigate(data.role === 'admin' ? '/admin/users' : '/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 420, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff' }}>Quản lý và theo dõi đồ án</Title>
          <Text type="secondary">Đăng nhập hệ thống quản lý đồ án</Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          
          {/* TRƯỜNG EMAIL */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email đăng nhập" />
          </Form.Item>

          {/* TRƯỜNG PASSWORD */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* QUÊN MẬT KHẨU LINK */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
             <Link to="/forgot-password" style={{ fontSize: 13 }}>Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;