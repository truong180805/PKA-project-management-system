import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Progress, Typography, Card, Input, Space, Tooltip, Avatar, Select, Row, Col, Statistic } from 'antd';
import { SearchOutlined, FolderOpenOutlined, UserOutlined, FilterOutlined, PieChartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // State bộ lọc cho GV
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Nếu là GV gọi API supervised, SV gọi my-projects
        const endpoint = isLecturer ? '/projects/supervised' : '/projects/my-projects';
        const { data } = await api.get(endpoint);
        setProjects(data);
      } catch (error) {
        console.error("Lỗi tải projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isLecturer]);

  const uniqueClasses = [...new Set(projects.map(p => p.class?.name))].filter(Boolean);

  const filteredProjects = projects.filter(item => {
      // 1. Lọc theo text tìm kiếm
      const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          item.leader?.fullName.toLowerCase().includes(searchText.toLowerCase());
      
      // 2. Lọc theo Lớp (GV)
      const matchClass = filterClass === 'all' || item.class?.name === filterClass;

      // 3. Lọc theo Trạng thái (GV)
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchSearch && matchClass && matchStatus;
  });

  // --- 3. CẤU HÌNH CỘT BẢNG ---
  const columns = [
    {
      title: 'Tên Nhóm / Đề Tài',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 15, color: '#1677ff', cursor: 'pointer' }} onClick={() => navigate(`/projects/${record._id}`)}>
                {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
                Leader: {record.leader?.fullName}
            </Text>
        </Space>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: ['class', 'name'],
      key: 'className',
      render: (text) => <Tag color="geekblue">{text}</Tag>,
      hidden: filterClass !== 'all'
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members',
      render: (members) => (
        <Avatar.Group maxCount={3} size="small">
            {members.map(m => (
                <Tooltip title={m.fullName} key={m._id}>
                    <Avatar src={m.avatarUrl} style={{ backgroundColor: '#87d068' }}>{m.fullName?.[0]}</Avatar>
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
        let text = status === 'approved' ? 'Đang thực hiện' : status === 'pending' ? 'Chờ duyệt' : 'Từ chối';
        if (status === 'completed') { color = 'blue'; text = 'Hoàn thành'; }
        
        return <Tag icon={status === 'approved' ? <CheckCircleOutlined /> : null} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress) => (
          <Progress 
              percent={progress || 0} 
              size="small" 
              status={progress === 100 ? 'success' : 'active'} 
              strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
              }}
          />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
            type="primary" 
            ghost
            size="small"
            icon={<FolderOpenOutlined />} 
            onClick={() => navigate(`/projects/${record._id}`)}
        >
          {isLecturer ? 'Kiểm tra' : 'Vào nhóm'}
        </Button>
      ),
    },
  ].filter(col => !col.hidden); // Lọc bỏ cột ẩn

  // --- GIAO DIỆN THỐNG KÊ NHANH CHO GV ---
  const renderStats = () => {
      if (!isLecturer) return null;
      const total = filteredProjects.length;
      const pending = filteredProjects.filter(p => p.status === 'pending').length;
      const completed = filteredProjects.filter(p => p.status === 'completed' || p.score).length;

      return (
          <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}><Card size="small"><Statistic title="Tổng số nhóm (Đang lọc)" value={total} prefix={<FolderOpenOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="Chờ duyệt đề tài" value={pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="Đã hoàn thành" value={completed} valueStyle={{ color: '#3f8600' }} /></Card></Col>
          </Row>
      )
  }

  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>{isLecturer ? 'Theo dõi Tiến độ Đồ án' : 'Nhóm Đồ án của tôi'}</Title>
        <Text type="secondary">
            {isLecturer 
                ? 'Quản lý, theo dõi và đánh giá tất cả các nhóm đồ án trong các lớp bạn phụ trách.' 
                : 'Truy cập nhanh vào không gian làm việc của các nhóm bạn tham gia.'}
        </Text>
      </div>

      {renderStats()}

      <Card bordered={false} styles={{ body: { padding: 0 } }}>
        {/* THANH CÔNG CỤ BỘ LỌC (TOOLBAR) */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <Input 
                placeholder="Tìm kiếm tên nhóm, sinh viên..." 
                prefix={<SearchOutlined />} 
                style={{ width: 250 }}
                onChange={e => setSearchText(e.target.value)}
            />
            
            {isLecturer && (
                <>
                    <Select 
                        defaultValue="all" 
                        style={{ width: 200 }} 
                        onChange={setFilterClass}
                        prefix={<FilterOutlined />}
                    >
                        <Option value="all">Tất cả lớp học</Option>
                        {uniqueClasses.map(cls => <Option key={cls} value={cls}>{cls}</Option>)}
                    </Select>

                    <Select 
                        defaultValue="all" 
                        style={{ width: 150 }} 
                        onChange={setFilterStatus}
                    >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="pending">Chờ duyệt</Option>
                        <Option value="approved">Đang thực hiện</Option>
                        <Option value="completed">Đã hoàn thành</Option>
                    </Select>
                </>
            )}
        </div>

        <Table 
            columns={columns} 
            dataSource={filteredProjects} 
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default ProjectsPage;