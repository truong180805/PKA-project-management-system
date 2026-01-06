import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, Radio, message, Select, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
const { TabPane } = Tabs;
const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinishLogin = async (values) => {
    setLoading(true);
    try {
    //call api login
    const { data } = await api.post('/users/login', values);

    //save info login
    localStorage.setItem('userInfo', JSON.stringify(data));
    navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại ');
    } finally {
      setLoading(false);
    }
  };
  
  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const submitData = { ...values };
      if (submitData.dateOfBirth) {
        submitData.dateOfBirth = submitData.dateOfBirth.format('YYYY-MM-DD');
      }

      await api.post('/users', submitData);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch(error){
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally{
      setLoading(false);
    }
  };

  //Interface
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems:'center',
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
      <h2 style={{ textAlign: 'center', color: '#1890ff' }}>HỆ THỐNG QUẢN LÝ VÀ THEO DÕI ĐỒ ÁN</h2>
        
        <Tabs defaultActiveKey="1" centered>
          {/* TAB ĐĂNG NHẬP */}
          <TabPane tab="Đăng Nhập" key="1">
            <Form name="login" onFinish={onFinishLogin} layout="vertical">
              <Form.Item
                name="account"
                rules={[{ required: true, message: 'Vui lòng nhập SĐT hoặc Email!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email hoặc Số điện thoại" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Đăng Nhập
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* TAB ĐĂNG KÝ */}
          <TabPane tab="Đăng Ký" key="2">
            <Form name="register" onFinish={onFinishRegister} layout="vertical">
              {/* Chọn Role trước */}
              <Form.Item name="role" initialValue="student" label="Bạn là:">
                <Radio.Group>
                  <Radio value="student">Sinh viên</Radio>
                  <Radio value="lecturer">Giảng viên</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                <Input prefix={<SolutionOutlined />} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item name="account" rules={[{ required: true, message: 'Nhập Số điện thoại hoặc email' }]}>
                <Input prefix={<UserOutlined />} placeholder="Số điện thoại hoặc email" />
              </Form.Item>

              <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
              </Form.Item>

              {/* Form động: Nếu là Sinh viên hiện mã SV, nếu GV hiện Khoa */}
              <Form.Item noStyle shouldUpdate={(prev, current) => prev.role !== current.role}>
                {({ getFieldValue }) => 
                  getFieldValue('role') === 'student' ? (
                    <>
                      <Form.Item name="studentId" rules={[{ required: true, message: 'Nhập Mã SV' }]}>
                        <Input placeholder="Mã Sinh Viên" />
                      </Form.Item>
                      <Form.Item name="className" rules={[{ required: true, message: 'Nhập Lớp' }]}>
                        <Input placeholder="Lớp (VD: D19...)" />
                      </Form.Item>
                      <Form.Item name="major" rules={[{ required: true, message: 'Nhập Ngành' }]}>
                        <Input placeholder="Chuyên ngành" />
                      </Form.Item>
                    </>
                  ) : (
                    <Form.Item name="department" rules={[{ required: true, message: 'Nhập Khoa' }]}>
                      <Input placeholder="Khoa / Bộ môn" />
                    </Form.Item>
                  )
                }
              </Form.Item>

              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng Ký
              </Button>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
};

export default LoginPage;
