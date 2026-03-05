import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, theme } from 'antd';
import { UserOutlined, BookOutlined, RocketOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = theme.useToken();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/admin-stats');
                setStats(data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div>
            <Title level={2}>Hệ thống Dashboard</Title>
            <Text type="secondary">Tổng quan dữ liệu toàn bộ nền tảng</Text>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic title="Tổng Người Dùng" value={stats.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic title="Giảng Viên" value={stats.totalLecturers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic title="Tổng Lớp Học" value={stats.totalClasses} prefix={<BookOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#fff1f0' }}>
                        <Statistic title="Nhóm Đồ Án" value={stats.totalProjects} prefix={<RocketOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                 <Col span={24}>
                    <Card title="Phân tích tăng trưởng">
                        <Statistic title="Người dùng mới (7 ngày qua)" value={stats.newUsers} prefix={<UserAddOutlined />} valueStyle={{ color: '#3f8600' }} />
                        <Text type="secondary">Tỉ lệ đăng ký tài khoản mới đang ổn định.</Text>
                    </Card>
                 </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;