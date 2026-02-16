import React, { useState } from 'react';
import { Typography, Form, Input, Button, Card, message, Result } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import api from '../api';

const { Title, Paragraph, Text } = Typography;

const SupportPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // Trạng thái đã gửi xong
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/support', values);
      message.success('Đã gửi yêu cầu hỗ trợ thành công!');
      setSubmitted(true); // Chuyển sang giao diện cảm ơn
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gửi thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Nếu gửi xong thì hiện màn hình Result
  if (submitted) {
      return (
          <div style={{ maxWidth: 600, margin: '50px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
              <Result
                status="success"
                title="Đã gửi yêu cầu hỗ trợ!"
                subTitle="Đội ngũ kỹ thuật đã nhận được thông tin và sẽ phản hồi qua email của bạn trong thời gian sớm nhất."
                extra={[
                    <Button type="primary" key="console" onClick={() => setSubmitted(false)}>
                        Gửi yêu cầu khác
                    </Button>
                ]}
              />
          </div>
      )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Trung tâm hỗ trợ</Title>
          <Paragraph type="secondary">
            Gặp vấn đề kỹ thuật hoặc cần hướng dẫn? Hãy điền thông tin bên dưới để liên hệ với quản trị viên.
          </Paragraph>
      </div>
      
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={onFinish}
            size="large"
        >
            <Form.Item 
                label="Tiêu đề vấn đề" 
                name="subject" 
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
                <Input prefix={<MailOutlined />} placeholder="VD: Lỗi không nộp được bài tập..." />
            </Form.Item>

            <Form.Item 
                label="Mô tả chi tiết" 
                name="description" 
                rules={[{ required: true, message: 'Vui lòng mô tả chi tiết lỗi' }]}
                help="Hãy mô tả các bước để tái hiện lỗi hoặc thông báo lỗi bạn gặp phải."
            >
                <Input.TextArea 
                    rows={6} 
                    placeholder="- Bước 1: Tôi vào trang...&#10;- Bước 2: Tôi ấn nút...&#10;- Kết quả: Hiện lỗi màu đỏ..." 
                />
            </Form.Item>

            <Form.Item>
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SendOutlined />} 
                    block 
                    loading={loading}
                    style={{ height: 48, fontSize: 16 }}
                >
                    Gửi yêu cầu hỗ trợ
                </Button>
            </Form.Item>
        </Form>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary">Hoặc liên hệ trực tiếp qua hotline: <Text strong>09xx.xxx.xxx</Text></Text>
      </div>
    </div>
  );
};

export default SupportPage;