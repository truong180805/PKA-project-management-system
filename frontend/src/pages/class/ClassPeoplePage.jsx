import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { List, Avatar, Button, Input, Typography, Tabs, Tag, message, Card, Badge, Popconfirm } from 'antd';
import { UserOutlined, SearchOutlined, MailOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const ClassPeoplePage = () => {
  const { classData, refetchClass } = useOutletContext(); // Lấy hàm refetch từ Layout
  const [searchText, setSearchText] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  // Lọc sinh viên chính thức
  const filteredStudents = classData?.student?.filter(s => 
    s.fullName.toLowerCase().includes(searchText.toLowerCase()) || 
    s.studentId?.includes(searchText)
  ) || [];

  // Lấy sinh viên chờ duyệt
  const pendingStudents = classData?.pendingStudents || [];

  // --- XỬ LÝ DUYỆT ---
  const handleApprove = async (studentId, isApproved) => {
    try {
      await api.put(`/classes/${classData._id}/approve`, { studentId, isApproved });
      message.success(isApproved ? 'Đã duyệt sinh viên' : 'Đã từ chối');
      refetchClass(); // Tải lại dữ liệu lớp ngay lập tức
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi thao tác');
    }
  };

  const UserItem = ({ user, role, isPending }) => (
    <List.Item
      actions={
        isPending && isLecturer ? [
            <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleApprove(user._id, true)}
            >
                Duyệt
            </Button>,
            <Popconfirm 
                title="Từ chối sinh viên này?" 
                onConfirm={() => handleApprove(user._id, false)}
                okText="Từ chối" cancelText="Hủy"
            >
                <Button danger size="small" icon={<CloseCircleOutlined />}>Từ chối</Button>
            </Popconfirm>
        ] : [
            <Button icon={<MessageOutlined />}>Nhắn tin</Button>
        ]
      }
    >
      <List.Item.Meta
        avatar={<Avatar size={48} src={user.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: role === 'GV' ? '#f56a00' : isPending ? '#faad14' : '#87d068' }} />}
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong style={{ fontSize: 16 }}>{user.fullName}</Text>
                {role === 'GV' && <Tag color="gold">Giảng viên</Tag>}
                {isPending && <Tag color="warning">Chờ duyệt</Tag>}
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Tabs defaultActiveKey="1" items={[
        {
            key: '1',
            label: 'Giảng Viên',
            children: (
                <div style={{ marginTop: 16 }}>
                    <Title level={4} style={{ color: '#1890ff', marginBottom: 24 }}>Giảng viên hướng dẫn</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={[classData?.lecturer]}
                        renderItem={item => item && <UserItem user={item} role="GV" />}
                    />
                </div>
            )
        },
        {
            key: '2',
            // Hiển thị badge số lượng chờ duyệt trên tab Sinh viên
            label: <Badge count={isLecturer ? pendingStudents.length : 0} offset={[10, 0]}>Sinh Viên ({classData?.student?.length})</Badge>,
            children: (
                <div style={{ marginTop: 16 }}>
                    
                    {/* PHẦN DUYỆT SINH VIÊN (CHỈ GV THẤY & KHI CÓ NGƯỜI CHỜ) */}
                    {isLecturer && pendingStudents.length > 0 && (
                        <Card 
                            title={`Yêu cầu tham gia (${pendingStudents.length})`} 
                            style={{ marginBottom: 24, borderColor: '#faad14', background: '#fffbe6' }}
                            size="small"
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={pendingStudents}
                                renderItem={item => <UserItem user={item} role="SV" isPending={true} />}
                            />
                        </Card>
                    )}

                    {/* DANH SÁCH CHÍNH THỨC */}
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