import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, List, Tag, Spin, Empty, theme } from 'antd';
import { UserOutlined, FileTextOutlined, FolderOpenOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import tiếng Việt cho dayjs (vd: "2 giờ trước")
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../../api';

// Cấu hình dayjs hiển thị thời gian tương đối
dayjs.extend(relativeTime);
dayjs.locale('vi'); 

const { Title, Text, Paragraph } = Typography;

const ClassStreamPage = () => {
    const { classData } = useOutletContext();
    const [stream, setStream] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = theme.useToken();

    useEffect(() => {
        const fetchStream = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/coursework/stream/class/${classData._id}`);
                setStream(data);
            } catch (error) {
                console.error('Lỗi tải bảng tin');
            } finally {
                setLoading(false);
            }
        };

        if (classData?._id) fetchStream();
    }, [classData]);

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Banner Lớp học */}
            <Card 
                style={{ 
                    marginBottom: 24, 
                    borderRadius: 12, 
                    background: 'linear-gradient(135deg, #1890ff 0%, #10239e 100%)',
                    border: 'none',
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                }}
                styles={{ body: { padding: '24px 32px' } }}
            >
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{classData?.name}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Giảng viên: {classData?.lecturer?.fullName}</Text>
            </Card>

            {/* Bảng tin (Stream) */}
            <Title level={4} style={{ marginBottom: 16 }}>Hoạt động gần đây</Title>
            
            <List
                itemLayout="vertical"
                dataSource={stream}
                locale={{ emptyText: <Empty description="Chưa có hoạt động nào trong lớp" /> }}
                renderItem={(item) => (
                    <Card 
                        hoverable 
                        style={{ marginBottom: 16, borderRadius: 8, background: token.colorBgContainer }}
                        styles={{ body: { padding: 20 } }}
                        onClick={() => navigate(item.url)} // Bấm vào the card sẽ chuyển đến tab tương ứng
                    >
                        <div style={{ display: 'flex', gap: 16 }}>
                            {/* Icon nhận diện loại hoạt động */}
                            <div style={{ 
                                width: 48, height: 48, borderRadius: '50%', 
                                background: item.type === 'assignment' ? '#fff2e8' : '#e6f4ff',
                                color: item.type === 'assignment' ? '#fa541c' : '#1677ff',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: 24, flexShrink: 0
                            }}>
                                {item.type === 'assignment' ? <FileTextOutlined /> : <FolderOpenOutlined />}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            {item.author?.fullName} đã đăng một {item.type === 'assignment' ? 'bài tập mới' : 'tài liệu mới'}
                                        </Text>
                                        <Title level={5} style={{ margin: '4px 0 8px 0', color: token.colorText }}>
                                            {item.title}
                                        </Title>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {dayjs(item.createdAt).fromNow()}
                                    </Text>
                                </div>
                                
                                {item.description && (
                                    <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                                        {item.description}
                                    </Paragraph>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            />
        </div>
    );
};

export default ClassStreamPage;