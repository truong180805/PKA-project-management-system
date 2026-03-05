import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Button, Card, List, Typography, Tag, Modal, Form, Input, InputNumber, message, Progress, Tabs, Badge, Alert, Popconfirm } from 'antd';
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const ClassTopicsPage = () => {
  const { classData } = useOutletContext();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState([]);
  const [myProject, setMyProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form] = Form.useForm();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  const fetchData = async () => {
    setLoading(true);
    try {
      const topicsRes = await api.get(`/coursework/topics/class/${classData._id}`);
      setTopics(topicsRes.data);

      if (!isLecturer) {
        const projectsRes = await api.get(`/projects/my-projects`);
        const projectInClass = projectsRes.data.find(p => p.class._id === classData._id || p.class === classData._id);
        setMyProject(projectInClass);
      }
    } catch (error) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (classData?._id) fetchData(); }, [classData]);

  // --- ACTIONS ---
  const handleCreateTopic = async (values) => {
    try {
      await api.post('/coursework/topics', { ...values, classId: classData._id });
      message.success(isLecturer ? 'Tạo đề tài thành công' : 'Đã gửi đề xuất, vui lòng chờ duyệt');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) { message.error('Thất bại'); }
  };

  // GV: Duyệt đề xuất đề tài mới do sinh viên tự nghĩ ra
  const handleApproveProposal = async (topicId, isApproved) => {
      try {
          await api.put('/coursework/topics/approve-proposal', { topicId, isApproved });
          message.success(isApproved ? 'Đã duyệt đề tài' : 'Đã từ chối');
          fetchData();
      } catch (error) {}
  }

  // --- RENDER ITEM ---
  const renderTopicItem = (item) => {
      // Dùng biến count mới từ Backend gửi lên
      const currentCount = item.registeredGroupCount || 0; 
      const isFull = currentCount >= item.maxGroups;
      const percent = Math.round((currentCount / item.maxGroups) * 100);
      
      // Kiểm tra xem nhóm của sinh viên này có đang làm đề tài này không
      const isMyTopic = myProject && (myProject.topic?._id === item._id || myProject.topic === item._id);

      return (
        <List.Item>
          <Card 
            title={
                <div>
                    <div style={{whiteSpace: 'normal'}}>{item.name}</div>
                    {!isLecturer && item.createdBy && item.createdBy._id !== classData.lecturer && (
                        <Tag icon={<UserOutlined />} color="cyan" style={{marginTop: 4, fontWeight: 'normal'}}>
                            Đề xuất bởi: {item.createdBy.fullName}
                        </Tag>
                    )}
                </div>
            }
            extra={
                isMyTopic ? <Tag color="green">Nhóm bạn đang làm</Tag> :
                isFull ? <Tag color="red">Đã đủ số nhóm</Tag> : <Tag color="blue">Còn trống</Tag>
            }
            actions={
                // NẾU LÀ SINH VIÊN: Chỉ đường cho họ sang Tab Nhóm để đăng ký
                !isLecturer ? [
                    isMyTopic ? (
                        <Button type="primary" onClick={() => navigate(`/projects/${myProject._id}`)}>Vào không gian làm việc</Button>
                    ) : (
                        <Button 
                            type="dashed" 
                            disabled={isFull || myProject} // Nếu đầy hoặc đã có nhóm thì khóa
                            icon={<TeamOutlined />}
                            onClick={() => navigate(`/classes/${classData._id}/groups`)}
                        >
                            {myProject ? 'Bạn đã có nhóm' : 'Tạo nhóm để chọn đề tài này'}
                        </Button>
                    )
                ] : [] 
            }
          >
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ height: 44 }}>{item.description || "Không có mô tả"}</Paragraph>
            
            {/* Tiến độ đăng ký */}
            <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <Text type="secondary">Đang thực hiện: {currentCount}/{item.maxGroups} Nhóm</Text>
                </div>
                <Progress percent={percent} showInfo={false} strokeColor={isFull ? '#ff4d4f' : '#1677ff'} size="small" />
            </div>

            {isLecturer && (
                <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 12, textAlign: 'center' }}>
                    <Text type="secondary" style={{fontSize: 12}}>
                        * Quản lý & duyệt nhóm thực hiện đề tài này tại <a onClick={() => navigate(`/classes/${classData._id}/groups`)}>Tab Nhóm</a>
                    </Text>
                </div>
            )}
          </Card>
        </List.Item>
      );
  };

  const approvedTopics = topics.filter(t => t.status === 'approved');
  const pendingTopics = topics.filter(t => t.status === 'pending');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{margin: 0}}>Đề tài Đồ án</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            {isLecturer ? 'Tạo Đề tài' : 'Đề xuất Đề tài mới'}
        </Button>
      </div>

      {!isLecturer && !myProject && (
          <Alert message="Hướng dẫn đăng ký" description="Để đăng ký đề tài, vui lòng sang tab 'Nhóm' để tạo nhóm và chọn đề tài bạn muốn làm." type="info" showIcon style={{marginBottom: 16}} />
      )}

      <Tabs defaultActiveKey="1" items={[
          {
              key: '1',
              label: 'Danh sách Đề tài',
              children: (
                  <List 
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }} 
                    dataSource={approvedTopics} 
                    loading={loading} 
                    renderItem={renderTopicItem} 
                    locale={{ emptyText: "Chưa có đề tài nào được công bố" }}
                  />
              )
          },
          {
              key: '2',
              label: <Badge count={pendingTopics.length} offset={[10, 0]}>Đề xuất Mới ({pendingTopics.length})</Badge>,
              children: (
                  <List 
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }} 
                    dataSource={pendingTopics} 
                    loading={loading} 
                    renderItem={(item) => (
                        <List.Item>
                            <Card 
                                title={item.name} 
                                extra={<Tag color="orange">Chờ duyệt</Tag>}
                                actions={isLecturer ? [
                                    <Popconfirm title="Duyệt đề tài này?" onConfirm={() => handleApproveProposal(item._id, true)}>
                                        <Button type="text" style={{color: 'green'}} icon={<CheckCircleOutlined />}>Duyệt</Button>
                                    </Popconfirm>,
                                    <Popconfirm title="Từ chối đề tài này?" onConfirm={() => handleApproveProposal(item._id, false)}>
                                        <Button type="text" danger icon={<CloseCircleOutlined />}>Từ chối</Button>
                                    </Popconfirm>
                                ] : []}
                            >
                                <Paragraph>{item.description}</Paragraph>
                                <Text type="secondary" style={{fontSize: 12}}>Đề xuất bởi: {item.createdBy?.fullName}</Text>
                            </Card>
                        </List.Item>
                    )} 
                    locale={{ emptyText: "Không có đề xuất nào đang chờ" }}
                  />
              )
          }
      ]} />

        {/* MODAL GIỮ NGUYÊN */}
        <Modal title={isLecturer ? "Tạo Đề tài mới" : "Đề xuất Đề tài với Giảng viên"} open={isModalOpen} onCancel={() => { setIsModalOpen(false); form.resetFields(); }} footer={null} destroyOnHidden>
            <Form form={form} layout="vertical" onFinish={handleCreateTopic}>
                <Form.Item name="name" label="Tên đề tài" rules={[{ required: true, message: 'Vui lòng nhập tên đề tài' }, { whitespace: true }]}><Input /></Form.Item>
                <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} /></Form.Item>
                {isLecturer && (
                <Form.Item name="maxGroups" label="Số nhóm tối đa" initialValue={1} rules={[{ required: true }]}>
                    <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
                )}
                <Form.Item><Button type="primary" htmlType="submit" block>Gửi</Button></Form.Item>
            </Form>
        </Modal>
    </div>
  );
};

export default ClassTopicsPage;