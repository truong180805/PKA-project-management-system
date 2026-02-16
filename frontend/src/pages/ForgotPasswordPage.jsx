import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/users/forgot-password', { email: values.email });
      message.success('Đã gửi email khôi phục! Vui lòng kiểm tra hộp thư.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Quên Mật Khẩu?</Title>
          <Text type="secondary">Nhập email để nhận liên kết đặt lại mật khẩu</Text>
        </div>

        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Gửi yêu cầu
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login"><ArrowLeftOutlined /> Quay lại Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;