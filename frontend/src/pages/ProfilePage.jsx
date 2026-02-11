import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, Row, Col, Avatar, Tabs, message, Descriptions, Tag, Divider } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, SaveOutlined, SolutionOutlined, BankOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form instances
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Lấy data từ localStorage khi load trang
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUser(storedUser);
    
    // Đổ dữ liệu vào form thông tin
    infoForm.setFieldsValue({
      fullName: storedUser.fullName,
      numberPhone: storedUser.numberPhone,
      className: storedUser.className,
      major: storedUser.major,
      department: storedUser.department
    });
  }, [infoForm]);

  // --- XỬ LÝ CẬP NHẬT THÔNG TIN ---
  const handleUpdateInfo = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', values);
      
      // Cập nhật lại localStorage để header hiển thị tên mới ngay lập tức
      // (Giữ lại token cũ, chỉ update thông tin user)
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      const newUserInfo = { ...data, token: currentUser.token };
      
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      setUser(newUserInfo);
      
      message.success('Cập nhật thông tin thành công!');
      
      // Trick nhỏ: Dispatch event để các component khác (như Header) biết storage thay đổi (nếu cần)
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      // Backend yêu cầu: oldPassword, password (mới)
      await api.put('/users/profile', {
        oldPassword: values.oldPassword,
        password: values.newPassword
      });
      
      message.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // --- NỘI DUNG TAB 1: THÔNG TIN CÁ NHÂN ---
  const InfoTab = () => (
    <Row gutter={24}>
      {/* CỘT TRÁI: AVATAR & THÔNG TIN TĨNH */}
      <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 24 }}>
        <Card>
          <Avatar size={100} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
          <Title level={4}>{user.fullName}</Title>
          <Tag color={user.role === 'lecturer' ? 'gold' : 'blue'}>
            {user.role === 'lecturer' ? 'GIẢNG VIÊN' : 'SINH VIÊN'}
          </Tag>
          
          <Divider />
          
          <div style={{ textAlign: 'left' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<span style={{color: '#8c8c8c'}}><MailOutlined/> Email</span>}>
                <Text strong>{user.email}</Text>
              </Descriptions.Item>
              {user.studentId && (
                <Descriptions.Item label={<span style={{color: '#8c8c8c'}}><SolutionOutlined/> MSSV</span>}>
                  <Text copyable>{user.studentId}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </Card>
      </Col>

      {/* CỘT PHẢI: FORM CẬP NHẬT */}
      <Col xs={24} md={16}>
        <Card title="Cập nhật thông tin" bordered={false}>
          <Form 
            form={infoForm} 
            layout="vertical" 
            onFinish={handleUpdateInfo}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="numberPhone" label="Số điện thoại" rules={[{ required: true }]}>
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            {/* Hiển thị form động tùy vai trò */}
            {user.role === 'student' ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="className" label="Lớp hành chính">
                    <Input prefix={<SolutionOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="major" label="Chuyên ngành">
                    <Input prefix={<BankOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <Form.Item name="department" label="Khoa / Bộ môn">
                <Input prefix={<BankOutlined />} />
              </Form.Item>
            )}

            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu thay đổi
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  // --- NỘI DUNG TAB 2: BẢO MẬT ---
  const SecurityTab = () => (
    <Row justify="center">
      <Col xs={24} md={12}>
        <Card title="Đổi mật khẩu" bordered={false}>
          <Form 
            form={passwordForm} 
            layout="vertical" 
            onFinish={handleChangePassword}
          >
            <Form.Item 
              name="oldPassword" 
              label="Mật khẩu hiện tại" 
              rules={[{ required: true, message: 'Nhập mật khẩu cũ để xác thực' }]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item 
              name="newPassword" 
              label="Mật khẩu mới" 
              rules={[
                { required: true, message: 'Nhập mật khẩu mới' },
                { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
              ]}
            >
              <Input.Password prefix={<SafetyCertificateOutlined />} />
            </Form.Item>

            <Form.Item 
              name="confirmPassword" 
              label="Xác nhận mật khẩu mới" 
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<SafetyCertificateOutlined />} />
            </Form.Item>

            <Button type="primary" danger htmlType="submit" icon={<LockOutlined />} loading={loading} block>
              Đổi mật khẩu
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '0 12px' }}>
      <Title level={2}>Hồ sơ cá nhân</Title>
      
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Tabs 
          defaultActiveKey="1" 
          items={[
            { key: '1', label: <span><UserOutlined /> Thông tin chung</span>, children: <InfoTab /> },
            { key: '2', label: <span><LockOutlined /> Bảo mật & Mật khẩu</span>, children: <SecurityTab /> },
          ]}
        />
      </div>
    </div>
  );
};

export default ProfilePage;