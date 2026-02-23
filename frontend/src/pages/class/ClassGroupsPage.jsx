import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Radio, Typography, Avatar, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

const ClassGroupsPage = () => {
  const { classData } = useOutletContext();
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States cho Form tạo nhóm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicMode, setTopicMode] = useState('select'); // 'select' hoặc 'propose'
  const [form] = Form.useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  // --- TẢI DỮ LIỆU ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách nhóm
      const resGroups = await api.get(`/projects/class/${classData._id}`);
      setGroups(resGroups.data);

      // 2. Lấy danh sách đề tài (để sinh viên chọn)
      if (!isLecturer) {
          const resTopics = await api.get(`/coursework/topics/class/${classData._id}`);
          // Chỉ lấy các đề tài đã được GV duyệt
          setTopics(resTopics.data.filter(t => t.status === 'approved'));
      }
    } catch (error) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classData?._id) fetchData();
  }, [classData]);

  // --- SINH VIÊN: TẠO NHÓM ---
  const handleCreateGroup = async (values) => {
    try {
      // Chuẩn bị payload theo đúng chuẩn Backend vừa viết
      const payload = {
        name: values.groupName,
        description: values.groupDesc,
        classId: classData._id,
      };

      if (topicMode === 'select') {
          payload.topicId = values.topicId;
      } else {
          payload.proposedTopic = {
              name: values.newTopicName,
              description: values.newTopicDesc
          };
      }

      await api.post('/projects', payload);
      
      message.success('Đã tạo nhóm! Vui lòng chờ Giảng viên duyệt.');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi tạo nhóm');
    }
  };

  // --- GIẢNG VIÊN: DUYỆT NHÓM ---
  const handleApprove = async (projectId, status) => {
      try {
          await api.put(`/projects/${projectId}/approve`, { status });
          message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} nhóm!`);
          fetchData();
      } catch (error) {
          message.error('Lỗi thao tác');
      }
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: 'Tên Nhóm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Đề tài',
      dataIndex: 'topic',
      key: 'topic',
      render: (topic) => topic ? (
          <Tooltip title={topic.description}>
             <Text strong>{topic.name}</Text>
          </Tooltip>
      ) : <Text type="secondary">Chưa có đề tài</Text>,
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members',
      render: (members) => (
        <Avatar.Group maxCount={4} size="small">
            {members.map(m => (
                <Tooltip title={m.fullName} key={m._id}>
                    <Avatar src={m.avatarUrl} icon={<UserOutlined />} />
                </Tooltip>
            ))}
        </Avatar.Group>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error';
        let text = status === 'approved' ? 'Đã duyệt' : status === 'pending' ? 'Chờ duyệt' : 'Từ chối';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
          if (isLecturer && record.status === 'pending') {
              return (
                  <Space>
                      <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record._id, 'approved')}>Duyệt</Button>
                      <Popconfirm title="Từ chối nhóm này?" onConfirm={() => handleApprove(record._id, 'rejected')}>
                          <Button size="small" danger icon={<CloseCircleOutlined />}>Từ chối</Button>
                      </Popconfirm>
                  </Space>
              )
          }
          // Nút cho sinh viên xin vào nhóm (có thể mở rộng sau)
          return null;
      }
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Danh sách Nhóm</Title>
        {!isLecturer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Tạo nhóm mới
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={groups} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* --- MODAL TẠO NHÓM (DÀNH CHO SINH VIÊN) --- */}
      <Modal 
        title="Tạo nhóm & Đăng ký đề tài" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
          <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
              <Title level={5} style={{ marginTop: 0 }}>1. Thông tin nhóm</Title>
              <Form.Item name="groupName" label="Tên nhóm" rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}>
                <Input placeholder="VD: Nhóm 1 - Web Dev" />
              </Form.Item>
              <Form.Item name="groupDesc" label="Mô tả / Mục tiêu của nhóm">
                <Input.TextArea rows={2} />
              </Form.Item>
          </div>

          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8, marginBottom: 24 }}>
              <Title level={5} style={{ marginTop: 0 }}>2. Đề tài Đồ án</Title>
              
              <Radio.Group 
                  value={topicMode} 
                  onChange={(e) => setTopicMode(e.target.value)} 
                  style={{ marginBottom: 16 }}
              >
                  <Radio value="select">Chọn đề tài có sẵn</Radio>
                  <Radio value="propose">Đề xuất đề tài mới</Radio>
              </Radio.Group>

              {topicMode === 'select' ? (
                  <Form.Item name="topicId" rules={[{ required: true, message: 'Vui lòng chọn 1 đề tài' }]}>
                      <Select placeholder="-- Chọn đề tài Giảng viên đã giao --">
                          {topics.map(t => (
                              <Option key={t._id} value={t._id}>{t.name}</Option>
                          ))}
                      </Select>
                  </Form.Item>
              ) : (
                  <>
                      <Form.Item name="newTopicName" rules={[{ required: true, message: 'Vui lòng nhập tên đề tài đề xuất' }]}>
                          <Input placeholder="Nhập tên đề tài mới..." />
                      </Form.Item>
                      <Form.Item name="newTopicDesc" rules={[{ required: true, message: 'Vui lòng mô tả qua về đề tài này' }]}>
                          <Input.TextArea rows={3} placeholder="Mô tả chức năng, công nghệ sử dụng..." />
                      </Form.Item>
                  </>
              )}
          </div>

          <Button type="primary" htmlType="submit" block size="large">Xác nhận tạo nhóm</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassGroupsPage;