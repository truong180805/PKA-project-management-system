import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Progress, List, Tag, Button, Spin, theme } from 'antd';
import { 
    ReadOutlined, ProjectOutlined, ClockCircleOutlined, 
    CheckCircleOutlined, RightOutlined, WarningOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../api';

const { Title, Text } = Typography;

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { token } = theme.useToken();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isLecturer = userInfo.role === 'lecturer';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Lỗi tải thống kê", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '20vh' }}><Spin size="large" /></div>;

    // --- GIAO DIỆN GIẢNG VIÊN ---
    const renderLecturerDashboard = () => (
        <>
            {/* Hàng 1: Thống kê nhanh */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: token.colorBgContainer }}>
                        <Statistic title="Lớp Đang Dạy" value={stats.totalClasses} prefix={<ReadOutlined style={{ color: '#1677ff' }} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: token.colorBgContainer }}>
                        <Statistic title="Tổng Số Nhóm Đồ Án" value={stats.totalProjects} prefix={<ProjectOutlined style={{ color: '#52c41a' }} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: token.colorBgContainer }}>
                        <Statistic title="Yêu Cầu Chờ Duyệt" value={stats.pendingApprovalsCount} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Biểu đồ và Danh sách cần xử lý */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card title="Tiến độ các lớp đang hoạt động" bordered={false} style={{ height: '100%', background: token.colorBgContainer }}>
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>Đo lường tiến độ của các nhóm đang thực hiện.</Text>
                        </div>
                        
                        <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                            {stats.classProgressList && stats.classProgressList.length > 0 ? (
                                stats.classProgressList.map((cls, index) => (
                                    <div key={index} style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text strong>{cls.name}</Text>
                                            <Text strong style={{ color: cls.progress === 100 ? '#52c41a' : '#1677ff' }}>{cls.progress}%</Text>
                                        </div>
                                        <Progress 
                                            percent={cls.progress} 
                                            showInfo={false} 
                                            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} 
                                            trailColor={token.colorFillAlter}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: 20, color: '#aaa' }}>
                                    Không có lớp nào đang thực hiện đồ án
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={16}>
                    <Card 
                        title="Các nhóm đang chờ duyệt đề tài" 
                        bordered={false} 
                        style={{ height: '100%', background: token.colorBgContainer }}
                        extra={<Button type="link" onClick={() => navigate('/projects')}>Xem tất cả</Button>}
                    >
                        <List
                            dataSource={stats.pendingProjectsList}
                            locale={{ emptyText: 'Tuyệt vời! Không có nhóm nào đang chờ duyệt.' }}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Button type="primary" size="small" onClick={() => navigate('/projects')}>Đi tới Duyệt</Button>]}
                                >
                                    <List.Item.Meta
                                        title={<Text strong>{item.name}</Text>}
                                        description={`Lớp: ${item.class?.name}`}
                                    />
                                    <Tag color="warning">Pending</Tag>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );

    // --- GIAO DIỆN SINH VIÊN ---
    const renderStudentDashboard = () => (
        <>
            {/* Lời chào */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Chào mừng trở lại, {userInfo.fullName.split(' ').pop()}!</Title>
                <Text type="secondary">Chúc bạn một ngày học tập và làm việc hiệu quả.</Text>
            </div>

            {/* Hàng 1: Thống kê nhanh và Tiến độ của tôi */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card bordered={false} style={{ background: token.colorBgContainer }}>
                                <Statistic title="Lớp Tham Gia" value={stats.totalClasses} prefix={<ReadOutlined style={{ color: '#1677ff' }} />} />
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card bordered={false} style={{ background: token.colorBgContainer }}>
                                <Statistic title="Dự Án Đang Làm" value={stats.totalProjects} prefix={<ProjectOutlined style={{ color: '#722ed1' }} />} />
                            </Card>
                        </Col>
                    </Row>
                </Col>
                
                <Col xs={24} md={16}>
                    <Card bordered={false} style={{ height: '100%', background: 'linear-gradient(to right, #1890ff, #5cdbd3)', color: 'white' }}>
                        <Row align="middle" style={{ height: '100%' }}>
                            <Col span={16}>
                                <Title level={3} style={{ color: 'white', marginTop: 0 }}>Tiến độ tổng quan</Title>
                                <p style={{ fontSize: 16, opacity: 0.9 }}>Bạn đã hoàn thành trung bình <strong>{stats.averageProgress}%</strong> khối lượng công việc trong các dự án của mình. Cố gắng lên nhé!</p>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <Progress type="circle" percent={stats.averageProgress} strokeColor="white" trailColor="rgba(255,255,255,0.3)" />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Công việc sắp tới & Truy cập nhanh dự án */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Công việc của bạn sắp đến hạn" bordered={false} style={{ height: '100%', background: token.colorBgContainer }}>
                        <List
                            dataSource={stats.upcomingTasks}
                            locale={{ emptyText: 'Bạn không có công việc nào sắp đến hạn.' }}
                            renderItem={task => {
                                const isLate = dayjs().isAfter(dayjs(task.dueDate));
                                return (
                                    <List.Item
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => navigate(`/projects/${task.project?._id}`)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = token.colorFillAlter}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <List.Item.Meta
                                            avatar={<ClockCircleOutlined style={{ fontSize: 24, color: isLate ? '#cf1322' : '#faad14' }} />}
                                            title={<Text strong>{task.title}</Text>}
                                            description={`Dự án: ${task.project?.name}`}
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Tag color={isLate ? 'error' : 'processing'}>
                                                {dayjs(task.dueDate).format('DD/MM/YYYY')}
                                            </Tag>
                                        </div>
                                    </List.Item>
                                )
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Truy cập dự án nhanh" bordered={false} style={{ height: '100%', background: token.colorBgContainer }} extra={<Button type="link" onClick={() => navigate('/projects')}>Xem tất cả</Button>}>
                        <List
                            grid={{ gutter: 16, column: 2 }}
                            dataSource={stats.myProjectsList}
                            locale={{ emptyText: 'Bạn chưa tham gia dự án nào.' }}
                            renderItem={project => (
                                <List.Item>
                                    <Card 
                                        size="small" 
                                        hoverable 
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                        style={{ background: token.colorFillAlter }}
                                    >
                                        <Text strong ellipsis>{project.name}</Text>
                                        <Progress percent={project.progress || 0} size="small" status={project.progress === 100 ? 'success' : 'active'} />
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );

    return (
        <div style={{ padding: '0 12px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
                <Text type="secondary">Bảng điều khiển {isLecturer ? 'Giảng viên' : 'Sinh viên'}</Text>
            </div>
            
            {isLecturer ? renderLecturerDashboard() : renderStudentDashboard()}
        </div>
    );
};

export default DashboardPage;