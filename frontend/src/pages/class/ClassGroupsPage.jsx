import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Button, Card, List, Typography, Avatar, Tooltip, Tag, Modal, Form, Input, message, Row, Col, Empty } from 'antd';
import { PlusOutlined, UserOutlined, LoginOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const ClassGroupsPage = () => {
  const { classData } = useOutletContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/class/${classData._id}`);
      setProjects(data);
    } catch (error) { message.error('Lỗi tải danh sách nhóm'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (classData?._id) fetchProjects(); }, [classData]);

  // Tạo nhóm (Chỉ là gom team, chưa có đề tài)
  const handleCreateGroup = async (values) => {
      try {
          await api.post('/projects', {
              name: values.name,
              description: values.description,
              classId: classData._id
          });
          message.success('Tạo nhóm thành công! Hãy sang tab "Đề tài" để đăng ký.');
          setIsModalOpen(false);
          fetchProjects();
      } catch (error) { message.error('Tạo nhóm thất bại'); }
  }

  const handleJoinGroup = async (projectId) => {
      try {
          await api.post('/projects/join', { projectId });
          message.success('Đã tham gia nhóm');
          fetchProjects();
      } catch (error) { message.error(error.response?.data?.message); }
  }

  // Tìm nhóm của tôi
  const myGroup = projects.find(p => p.members.some(m => m._id === userInfo._id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
         <Title level={3} style={{ margin: 0 }}>Danh sách Nhóm</Title>
         {!isLecturer && !myGroup && (
             <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                 Tạo nhóm mới
             </Button>
         )}
      </div>

      {/* HIỂN THỊ NHÓM CỦA TÔI NỔI BẬT */}
      {!isLecturer && myGroup && (
          <Card 
            style={{ marginBottom: 24, background: '#f6ffed', borderColor: '#b7eb8f' }}
            title={<><HomeOutlined /> Nhóm của bạn: <Text strong>{myGroup.name}</Text></>}
            extra={<Button type="primary" onClick={() => navigate(`/projects/${myGroup._id}`)}>Vào không gian làm việc</Button>}
          >
              <Text>Thành viên: </Text>
              <Avatar.Group size="small">
                  {myGroup.members.map(m => <Tooltip title={m.fullName} key={m._id}><Avatar style={{background: '#87d068'}}>{m.fullName[0]}</Avatar></Tooltip>)}
              </Avatar.Group>
          </Card>
      )}

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={projects}
        loading={loading}
        locale={{ emptyText: <Empty description="Chưa có nhóm nào được tạo" /> }}
        renderItem={item => {
            const isMine = item.members?.some(m => m._id === userInfo._id);
            return (
                <List.Item>
                    <Card
                        title={item.name}
                        extra={isMine ? <Tag color="blue">Nhóm tôi</Tag> : null}
                        actions={
                            !isLecturer && !myGroup && !isMine ? [
                                <Button type="link" icon={<LoginOutlined />} onClick={() => handleJoinGroup(item._id)}>Tham gia</Button>
                            ] : isLecturer ? [
                                <Button type="link" onClick={() => navigate(`/projects/${item._id}`)}>Xem tiến độ</Button>
                            ] : []
                        }
                    >
                        <div style={{ marginBottom: 12 }}>
                            <Text type="secondary" style={{fontSize: 12}}>Leader: {item.leader?.fullName || "chưa có leader"}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Avatar.Group maxCount={4} size="small">
                                {item.members.map(m => (
                                    <Tooltip title={m.fullName} key={m._id}>
                                        <Avatar src={m.avatarUrl} icon={<UserOutlined />} />
                                    </Tooltip>
                                ))}
                            </Avatar.Group>
                            <Tag>{item.members.length} tv</Tag>
                        </div>
                    </Card>
                </List.Item>
            )
        }}
      />

      <Modal title="Tạo nhóm mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
          <Form onFinish={handleCreateGroup} layout="vertical">
              <Form.Item name="name" label="Tên nhóm" rules={[{required: true}]}><Input placeholder="VD: Nhóm 1 - Siêu nhân" /></Form.Item>
              <Form.Item name="description" label="Mô tả"><Input.TextArea placeholder="Tìm bạn..." /></Form.Item>
              <Button type="primary" htmlType="submit" block>Tạo nhóm</Button>
          </Form>
      </Modal>
    </div>
  );
};

export default ClassGroupsPage;