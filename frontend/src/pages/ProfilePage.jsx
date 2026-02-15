import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Form, Input, Button, Row, Col, Avatar, Tabs, message, Descriptions, Tag, Divider, Upload } from 'antd'; // Thêm Upload
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined, SaveOutlined, SolutionOutlined, BankOutlined, SafetyCertificateOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(''); // State lưu link ảnh mới
  
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUser(storedUser);
    setAvatarUrl(storedUser.avatarUrl); // Init avatar
    
    infoForm.setFieldsValue({
      fullName: storedUser.fullName,
      numberPhone: storedUser.numberPhone,
      className: storedUser.className,
      major: storedUser.major,
      department: storedUser.department
    });
  }, [infoForm]);

  // --- XỬ LÝ UPLOAD ẢNH ---
  const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' phải khớp với backend upload.single('file')

    try {
      message.loading({ content: 'Đang tải ảnh lên...', key: 'upload' });
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setAvatarUrl(data.url); // Cập nhật hiển thị ngay lập tức
      message.success({ content: 'Tải ảnh thành công!', key: 'upload' });
      onSuccess(data);
    } catch (error) {
      message.error({ content: 'Lỗi tải ảnh!', key: 'upload' });
      onError(error);
    }
  };

  // --- XỬ LÝ CẬP NHẬT THÔNG TIN ---
  const handleUpdateInfo = async (values) => {
    setLoading(true);
    try {
      // Gửi cả avatarUrl mới (nếu có) lên server update user
      const payload = { ...values, avatarUrl };

      const { data } = await api.put('/users/profile', payload);
      
      // Update LocalStorage
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      const newUserInfo = { ...data, token: currentUser.token };
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      
      setUser(newUserInfo);
      message.success('Cập nhật hồ sơ thành công!');
      
      // Force reload để Header cập nhật avatar mới
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // (Giữ nguyên logic Đổi mật khẩu cũ...)
  const handleChangePassword = async (values) => {
    // ... Copy lại logic cũ ...
     setLoading(true);
    try {
      await api.put('/users/profile', {
        oldPassword: values.oldPassword,
        password: values.newPassword
      });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // --- TAB INFO ---
  const InfoTab = () => (
    <Row gutter={24}>
      {/* CỘT TRÁI: AVATAR & UPLOAD */}
      <Col xs={24} md={8} style={{ textAlign: 'center', marginBottom: 24 }}>
        <Card>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar 
                size={120} 
                src={avatarUrl} 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff', marginBottom: 16, border: '4px solid #f0f0f0' }} 
            />
            {/* Nút Upload nằm đè lên góc avatar */}
            <Upload 
                customRequest={handleUploadAvatar} 
                showUploadList={false}
                accept="image/*"
            >
                <Button 
                    shape="circle" 
                    icon={<CameraOutlined />} 
                    style={{ position: 'absolute', bottom: 20, right: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
                />
            </Upload>
          </div>
          
          <Title level={4} style={{marginTop: 0}}>{user.fullName}</Title>
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

      {/* CỘT PHẢI: FORM */}
      <Col xs={24} md={16}>
        <Card title="Cập nhật thông tin" bordered={false}>
          <Form form={infoForm} layout="vertical" onFinish={handleUpdateInfo}>
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

            {user.role === 'student' ? (
              <Row gutter={16}>
                <Col span={12}><Form.Item name="className" label="Lớp hành chính"><Input prefix={<SolutionOutlined />} /></Form.Item></Col>
                <Col span={12}><Form.Item name="major" label="Chuyên ngành"><Input prefix={<BankOutlined />} /></Form.Item></Col>
              </Row>
            ) : (
              <Form.Item name="department" label="Khoa / Bộ môn"><Input prefix={<BankOutlined />} /></Form.Item>
            )}

            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu thay đổi
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  // --- TAB SECURITY (Giữ nguyên) ---
  const SecurityTab = () => (
    <Row justify="center">
      <Col xs={24} md={12}>
        <Card title="Đổi mật khẩu" bordered={false}>
          <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
            <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
              <Input.Password prefix={<SafetyCertificateOutlined />} />
            </Form.Item>
            <Form.Item name="confirmPassword" label="Xác nhận mật khẩu mới" dependencies={['newPassword']} rules={[
                { required: true },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}>
              <Input.Password prefix={<SafetyCertificateOutlined />} />
            </Form.Item>
            <Button type="primary" danger htmlType="submit" icon={<LockOutlined />} loading={loading} block>Đổi mật khẩu</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: '0 12px' }}>
      <Title level={2}>Hồ sơ cá nhân</Title>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Tabs defaultActiveKey="1" items={[
            { key: '1', label: <span><UserOutlined /> Thông tin chung</span>, children: <InfoTab /> },
            { key: '2', label: <span><LockOutlined /> Bảo mật</span>, children: <SecurityTab /> },
        ]} />
      </div>
    </div>
  );
};

export default ProfilePage;