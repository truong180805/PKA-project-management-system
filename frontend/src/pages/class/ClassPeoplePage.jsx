import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { List, Avatar, Button, Input, Typography, Tabs, Tag } from 'antd';
import { UserOutlined, SearchOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ClassPeoplePage = () => {
  const { classData } = useOutletContext();
  const [searchText, setSearchText] = useState('');

  // Lọc danh sách sinh viên theo search
  const filteredStudents = classData?.student?.filter(s => 
    s.fullName.toLowerCase().includes(searchText.toLowerCase()) || 
    s.studentId?.includes(searchText)
  ) || [];

  const UserItem = ({ user, role }) => (
    <List.Item
      actions={[
        <Button icon={<MessageOutlined />}>Nhắn tin</Button>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar size={48} src={user.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: role === 'GV' ? '#f56a00' : '#87d068' }} />}
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ fontSize: 16 }}>{user.fullName}</Text>
                {role === 'GV' && <Tag color="gold">Giảng viên</Tag>}
            </div>
        }
        description={
            <div>
                {role === 'SV' && <Text type="secondary" style={{ marginRight: 16 }}>MSSV: {user.studentId}</Text>}
                <Text type="secondary"><MailOutlined /> {user.email}</Text>
            </div>
        }
      />
    </List.Item>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      
      <Tabs defaultActiveKey="1" items={[
        {
            key: '1',
            label: 'Giảng Viên',
            children: (
                <div style={{ marginTop: 16 }}>
                    <Title level={4} style={{ color: '#1890ff', marginBottom: 24 }}>Giảng viên hướng dẫn</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={[classData?.lecturer]} // Chuyển object thành array để map
                        renderItem={item => item && <UserItem user={item} role="GV" />}
                    />
                </div>
            )
        },
        {
            key: '2',
            label: `Sinh Viên (${classData?.student?.length})`,
            children: (
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={4} style={{ margin: 0 }}>Danh sách lớp</Title>
                        <Input 
                            prefix={<SearchOutlined />} 
                            placeholder="Tìm sinh viên..." 
                            style={{ width: 250 }} 
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                    <List
                        itemLayout="horizontal"
                        dataSource={filteredStudents}
                        pagination={{ pageSize: 10 }}
                        renderItem={item => <UserItem user={item} role="SV" />}
                    />
                </div>
            )
        }
      ]} />
    </div>
  );
};

export default ClassPeoplePage;