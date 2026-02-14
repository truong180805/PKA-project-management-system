import React from 'react';
import { Typography, Form, Input, Button, Card, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SupportPage = () => {
  const onFinish = () => {
    message.success('Đã gửi yêu cầu hỗ trợ. Chúng tôi sẽ phản hồi sớm!');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <Title level={2}>Trung tâm hỗ trợ</Title>
      <Paragraph>Gặp vấn đề kỹ thuật hoặc cần hướng dẫn? Hãy gửi tin nhắn cho đội ngũ admin.</Paragraph>
      
      <Card style={{ textAlign: 'left', marginTop: 24 }}>
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Tiêu đề vấn đề" name="subject" rules={[{ required: true }]}>
                <Input placeholder="VD: Lỗi không nộp được bài..." />
            </Form.Item>
            <Form.Item label="Mô tả chi tiết" name="description" rules={[{ required: true }]}>
                <Input.TextArea rows={5} placeholder="Mô tả các bước để tái hiện lỗi..." />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<MailOutlined />} block size="large">Gửi yêu cầu</Button>
        </Form>
      </Card>
    </div>
  );
};
export default SupportPage;