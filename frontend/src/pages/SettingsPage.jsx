import React from 'react';
import { Typography, Switch, Card, List, Select } from 'antd';
import { BulbOutlined, GlobalOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Cài đặt hệ thống</Title>
      
      <Card title="Giao diện & Ngôn ngữ" style={{ marginBottom: 24 }}>
        <List>
            <List.Item extra={<Switch defaultChecked />}>
                <List.Item.Meta avatar={<BulbOutlined />} title="Chế độ tối (Dark Mode)" description="Chuyển đổi giao diện sáng/tối" />
            </List.Item>
            <List.Item extra={<Select defaultValue="vi" style={{ width: 120 }} options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }]} />}>
                <List.Item.Meta avatar={<GlobalOutlined />} title="Ngôn ngữ" description="Ngôn ngữ hiển thị của hệ thống" />
            </List.Item>
        </List>
      </Card>

      <Card title="Thông báo">
        <List>
            <List.Item extra={<Switch defaultChecked />}>
                <List.Item.Meta avatar={<BellOutlined />} title="Thông báo qua Email" description="Nhận email khi có bài tập mới hoặc deadline" />
            </List.Item>
        </List>
      </Card>
    </div>
  );
};
export default SettingsPage;