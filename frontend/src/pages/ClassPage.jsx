import React, { useState, useEffect } from 'react';
import { Button, Card, theme, List, Typography, Modal, Form, Input, message, Tag, Row, Col, Statistic, Switch, Empty } from 'antd';
import { PlusOutlined, CopyOutlined, TeamOutlined, UsergroupAddOutlined, ArrowRightOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ClassPage = () => {
    const { token } = theme.useToken();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isLecturer = userInfo?.role === 'lecturer';

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/classes');
            
            console.log("Dữ liệu Lớp:", data); 
            setClasses(data);
        } catch (error) {
            message.error('Không thể tải danh sách lớp');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (!isModalOpen) {
            form.resetFields();
        }
    }, [isModalOpen, form]);

    const handleCreateClass = async (values) => {
        try {
            const submitData = {
                name: values.name,
                semester: values.semester,
                description: values.description,
                settings: {
                    autoApprove: values.autoApprove || false
                }
            };
            await api.post('/classes', submitData);
            message.success('Tạo lớp thành công');
            setIsModalOpen(false);
            fetchClasses();
        } catch (error) {
            message.error(error.response?.data?.message || 'Tạo lớp thất bại');
        }
    };

    const handleJoinClass = async (values) => {
        try {
            const { data } = await api.post('/classes/join', values);
            if (data.status === 'joined') {
                message.success(data.message);
            } else {
                message.info(data.message);
            }
            setIsModalOpen(false);
            fetchClasses();
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể tham gia lớp');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Đã sao chép mã lớp!');
    };

    return (
        <div style={{ padding: '0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Lớp Đồ Án Của Tôi</Title>
                <Button
                    type="primary"
                    icon={isLecturer ? <PlusOutlined /> : <UsergroupAddOutlined />}
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                >
                    {isLecturer ? 'Tạo Lớp Mới' : 'Tham Gia Lớp'}
                </Button>
            </div>

            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
                loading={loading}
                dataSource={classes}
                locale={{ emptyText: <Empty description="Chưa có lớp học nào" /> }}
                renderItem={(item) => (
                    
                    <List.Item key={item._id}>
                        <Card
                            hoverable                          
                            title={<Text strong style={{ fontSize: 16 }}>{item.name || "Lớp (Mất tên)"}</Text>}
                            extra={
                                <Button type="link" onClick={() => navigate(`/classes/${item._id}`)}>
                                    Truy cập
                                </Button>
                            }
                            
                            style={{
                                borderRadius: 8,
                                overflow: 'hidden',
                            }}
                            styles={{
                                header: {
                                    backgroundColor: token.colorBgContainer,
                                    borderBottom: '1px solid #d6e4ff'
                                },
                                body: { padding: '24px' }
                            }}
                        >
                            <div style={{ minHeight: 80 }}>
                                {item.description && <p style={{ color: '#8c8c8c', marginBottom: 12 }}>{item.description}</p>}

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Thành viên"
                                            value={item.student?.length || 0}
                                            prefix={<TeamOutlined />}
                                            styles={{ content: { fontSize: 16 } }}
                                        />
                                    </Col>

                                    <Col span={12}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Mã tham gia
                                            </Text>

                                            <Tag
                                                icon={<CopyOutlined />}
                                                color="warning"
                                                style={{ cursor: 'pointer', margin: 0, marginTop: 4 }}
                                                onClick={() => copyToClipboard(item.classCode)}
                                            >
                                                {item.classCode}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                                {item.settings?.autoApprove && (
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color="success">Tự động duyệt: Bật</Tag>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
                title={isLecturer ? "Tạo Lớp Đồ Án Mới" : "Tham Gia Lớp Đồ Án"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                {isLecturer ? (
                    <Form 
                        form={form} 
                        onFinish={handleCreateClass} 
                        layout="vertical" 
                        initialValues={{ autoApprove: false }}
                    >
                        <Form.Item name="name" label="Tên lớp" rules={[{ required: true, message: 'Nhập tên lớp' }]}>
                            <Input placeholder="VD: Đồ Án Cơ Sở" />
                        </Form.Item>
                        <Form.Item name="semester" label="Học kỳ" rules={[{ required: true, message: 'Nhập học kỳ' }]}>
                            <Input placeholder="VD: HK1-2024" />
                        </Form.Item>
                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea placeholder="Thông tin thêm..." />
                        </Form.Item>
                        <Form.Item
                            name="autoApprove"
                            label="Cài đặt tham gia"
                            valuePropName="checked"
                            extra="Nếu bật, sinh viên nhập đúng mã sẽ vào lớp ngay mà không cần duyệt."
                        >
                            <Switch checkedChildren="Tự động" unCheckedChildren="Thủ công" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ marginTop: 10 }}>
                            Tạo Ngay
                        </Button>
                    </Form>
                ) : (
                    <Form form={form} onFinish={handleJoinClass} layout="vertical">
                        <Form.Item name="classCode" label="Nhập mã lớp" rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}>
                            <Input placeholder="Mã 6 ký tự do giảng viên cung cấp" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
                            Gửi Yêu Cầu
                        </Button>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default ClassPage;