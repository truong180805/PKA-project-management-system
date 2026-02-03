import React, {useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Tag, Button, Spin } from 'antd';
import { 
  ReadOutlined, 
  ProjectOutlined, 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../api';

const { Title, Text } = Typography;

const DashboardPage = () => {
    const [ stats, setStats ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error('Lỗi tải thống kê');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;

    //interface for lecturer
    if (userInfo.role === 'lecturer') {
        return (
        <div>
            <Title level={2}>Tổng quan giảng dạy</Title>
            <Row gutter={[16, 16]}>
            <Col span={8}>
                <Card>
                <Statistic 
                    title="Lớp đang phụ trách" 
                    value={stats?.totalClasses} 
                    prefix={<ReadOutlined />} 
                    valueStyle={{ color: '#1890ff' }}
                />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                <Statistic 
                    title="Tổng số nhóm đồ án" 
                    value={stats?.totalProjects} 
                    prefix={<ProjectOutlined />} 
                    valueStyle={{ color: '#3f8600' }}
                />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                <Statistic 
                    title="Nhóm chờ duyệt" 
                    value={stats?.pendingProjects} 
                    prefix={<WarningOutlined />} 
                    valueStyle={{ color: '#cf1322' }}
                />
                </Card>
            </Col>
            </Row>
            
            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <img 
                    src="https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png" 
                    alt="Welcome" 
                    style={{ maxWidth: '400px', opacity: 0.8 }} 
                />
                <Title level={4} style={{ color: '#8c8c8c' }}>Chào mừng trở lại, Giảng viên {userInfo.fullName}</Title>
            </div>
        </div>
        );
    }

    //for student
    return (
        <div>
        <Title level={2}>Tổng quan học tập</Title>
        
        {/* 1. THẺ THỐNG KÊ */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
            <Card>
                <Statistic 
                title="Lớp đã tham gia" 
                value={stats?.totalClasses} 
                prefix={<ReadOutlined />} 
                />
            </Card>
            </Col>
            <Col xs={24} sm={8}>
            <Card>
                <Statistic 
                title="Nhóm đồ án" 
                value={stats?.totalProjects} 
                prefix={<ProjectOutlined />} 
                />
            </Card>
            </Col>
            <Col xs={24} sm={8}>
            <Card>
                <Statistic 
                title="Task chưa hoàn thành" 
                value={stats?.pendingTasks} 
                prefix={<WarningOutlined />} 
                styles={{
                    content: { 
                        color: stats?.pendingTasks > 0 ? '#cf1322' : '#3f8600' 
                    }
                }}
                />
            </Card>
            </Col>
        </Row>

        {/* 2. DANH SÁCH TASK SẮP ĐẾN HẠN */}
        <Row gutter={16}>
            <Col xs={24} lg={16}>
                <Card 
                    title={<span><ClockCircleOutlined /> Công việc sắp đến hạn</span>}
                    extra={<Button type="link" onClick={() => navigate('/classes')}>Đến lớp học <RightOutlined /></Button>}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={stats?.upcomingTasks || []}
                        locale={{ emptyText: 'Tuyệt vời! Bạn không có deadline nào sắp tới.' }}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Tag color="orange">
                                        {dayjs(item.dueDate).format('DD/MM')}
                                    </Tag>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                                    title={<Text strong>{item.title}</Text>}
                                    description={
                                        <span>
                                            Trong dự án: <Text code>{item.project?.name}</Text>
                                        </span>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                {/* Cột phụ: Có thể để lịch hoặc thông báo (tạm để trống hoặc ảnh) */}
                <Card style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <img 
                        src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" 
                        alt="Study" 
                        style={{ width: '80%', marginBottom: 20 }}
                    />
                    <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>"Học, học nữa, học mãi"</Text>
                </Card>
            </Col>
        </Row>
        </div>
    );
};

export default DashboardPage;