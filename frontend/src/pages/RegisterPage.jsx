import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SolutionOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // State để xem role đang chọn là gì để hiện/ẩn MSSV
  const [role, setRole] = useState('student'); 

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post('/users', {
          ...values,
          role: role // Gửi role từ state
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      message.success('Đăng ký thành công!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff' }}>Đăng Ký</Title>
          <Text type="secondary">Tạo tài khoản mới</Text>
        </div>

        <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large" initialValues={{ role: 'student' }}>
          
          {/* HỌ TÊN & SĐT */}
          <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
                  </Form.Item>
              </Col>
              <Col span={12}>
                  <Form.Item name="numberPhone" rules={[{ required: true, message: 'Nhập SĐT!' }]}>
                    <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                  </Form.Item>
              </Col>
          </Row>

          {/* EMAIL (QUAN TRỌNG) */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
            help="Email này sẽ dùng để đăng nhập và khôi phục mật khẩu"
          >
            <Input prefix={<MailOutlined />} placeholder="Email (dùng để đăng nhập)" />
          </Form.Item>

          {/* MẬT KHẨU */}
          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu > 6 ký tự' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
          </Form.Item>

          {/* CHỌN VAI TRÒ */}
          <Row gutter={16}>
              <Col span={12}>
                  <Form.Item label="Bạn là?">
                      <Select defaultValue="student" onChange={setRole}>
                          <Option value="student">Sinh viên</Option>
                          <Option value="lecturer">Giảng viên</Option>
                      </Select>
                  </Form.Item>
              </Col>
              
              {role === 'student' && (
                  <Col span={12}>
                      <Form.Item name="studentId" rules={[{ required: true, message: 'Nhập MSSV!' }]}>
                          <Input prefix={<SolutionOutlined />} placeholder="Mã số sinh viên" />
                      </Form.Item>
                  </Col>
              )}
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký tài khoản
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;