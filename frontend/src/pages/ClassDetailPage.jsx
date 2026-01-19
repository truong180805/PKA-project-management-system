import React , { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Col, Avatar, Tooltip, Input, Tabs, Table, Typography, Tag, Button, Spin, message, Card, Popconfirm, Breadcrumb, Row, Form, Modal } from 'antd';
import { CheckCircleOutlined, LoginOutlined, TeamOutlined, UserOutlined,CloseCircleOutlined, ProjectOutlined, ArrowLeftOutlined, PlusOutlined  } from '@ant-design/icons';
import api from '../api';

const { Title, Text, Paragraph } = Typography;

const ClassDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    //state data
    const [ classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [projectLoading, setProjectLoading] = useState(false);

    //state modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // info user
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isLecturer = userInfo?.role === 'lecturer';

    const fetchClassDetails = async () => {
        setLoading(true);

        try {
            const { data } = await api.get(`/classes/${id}`);
            setClassData(data);
        } catch(error){
            message.error('Không thể tải thông tin lớp');
            navigate('/classes');
        }finally{
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        setProjectLoading(true);
        
        try{
            const { data } = await api.get(`/projects/class/${id}`);
            setProjects(data);
        } catch (error) {
            message.error('Lỗi tải danh sách nhóm');
        } finally {
            setProjectLoading(false);
        }
    };

    useEffect(() => {
        fetchClassDetails();
        fetchProjects();
    }, [id]);

    const handleApproveStudent = async (studentId, isApproved) => {
        
        try {
            await api.put(`/classes/${id}/approve`, { studentId, isApproved });
            message.success(isApproved ? 'Đã duyệt sinh viên' : 'Đã từ chối yêu cầu');
            fetchClassDetails();
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleCreateProject = async (values) => {

        try{
            await api.post('/projects', {
                ...values,
                classId: id
            });
            message.success('Tạo nhóm thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchProjects();
        } catch (error) {
            message.error(error.response?.data?.message || 'Tạo nhóm thất bại');
        }
    };

    const handleJoinProject = async (projectId) => {

        try {
        await api.post('/projects/join', { projectId });
        message.success('Đã tham gia nhóm!');
        fetchProjects();
        } catch (error) {
        message.error(error.response?.data?.message || 'Không thể tham gia');
        }
    };

    const handleApproveProject = async (projectId, status) => {
        try {
        await api.put(`/projects/${projectId}/approve`, { status });
        message.success(`Đã cập nhật trạng thái: ${status}`);
        fetchProjects();
        } catch (error) {
        message.error('Lỗi cập nhật trạng thái');
        }
    };

    const memberColumns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <Text strong><UserOutlined/> {text}</Text>,
        },
        {
            title: 'Mã SV',
            dataIndex: 'studentId',
            key: 'studentId',
            render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'numberPhone',
            key: 'numberPhone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text || <Text type="secondary" italic>Chưa cập nhật</Text>
        },
    ];
    
    const pendingColumns = [
        ...memberColumns,
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                    type="primary"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApproveStudent(record._id, true)}
                    >
                        Duyệt
                    </Button>
                    <Popconfirm
                        title="Từ chối sinh viên này?"
                        onConfirm={() => handleApproveStudent(record._id, false)}
                        okText="Từ chối"
                        cancelText="Hủy"
                    >
                        <Button
                        danger
                        size='small'
                        icon={<CloseCircleOutlined />}
                        >
                            Từ chối
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const renderProjects = () => {
        if (projectLoading) return <div style={{textAlign: 'center'}}><Spin /></div>;

        const myProjectId = projects.find(p => p.members.some(m => m._id === userInfo._id))?._id;

        return (
            <div>
                {/* Nút tạo nhóm cho Sinh viên (chỉ hiện khi chưa có nhóm) */}
                {!isLecturer && !myProjectId && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
                    Đăng ký Đề tài / Tạo nhóm
                </Button>
                )}

                <Row gutter={[16, 16]}>
                {projects.map(project => (
                    <Col key={project._id} xs={24} lg={12} xl={8}>
                    <Card
                        hoverable
                        styles={{ header: { backgroundColor: project.status === 'approved' ? '#f6ffed' : '#fffbe6' } }}
                        title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong ellipsis style={{ maxWidth: 180 }}>{project.name}</Text>
                            {project.status === 'pending' ? <Tag color="orange">Chờ duyệt</Tag> : 
                            project.status === 'approved' ? <Tag color="green">Đã duyệt</Tag> : <Tag color="red">Từ chối</Tag>}
                        </div>
                        }
                        extra={
                            // Logic nút bấm trên thẻ
                            isLecturer && project.status === 'pending' ? (
                                <Popconfirm title="Duyệt đề tài này?" onConfirm={() => handleApproveProject(project._id, 'approved')}>
                                    <Button size="small" type="primary">Duyệt</Button>
                                </Popconfirm>
                            ) : (
                                // Nếu là SV và chưa có nhóm -> Hiện nút Join
                                !isLecturer && !myProjectId && (
                                    <Button size="small" icon={<LoginOutlined />} onClick={() => handleJoinProject(project._id)}>Tham gia</Button>
                                )
                            )
                        }
                    >
                        <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ minHeight: 44 }}>
                            {project.description || "Không có mô tả"}
                        </Paragraph>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <TeamOutlined style={{ marginRight: 6 }} /> 
                                <Text>{project.members.length} thành viên</Text>
                            </div>
                            {/* Hiển thị Avatar thành viên */}
                            <Avatar.Group maxCount={3} size="small">
                                {project.members.map(mem => (
                                    <Tooltip title={mem.fullName} key={mem._id}>
                                        <Avatar style={{ backgroundColor: '#87d068' }}>{mem.fullName.charAt(0)}</Avatar>
                                    </Tooltip>
                                ))}
                            </Avatar.Group>
                        </div>
                        
                        {/* Dấu hiệu nhận biết nhóm của mình */}
                        {project.members.some(m => m._id === userInfo._id) && (
                            <div style={{ marginTop: 12, textAlign: 'right' }}>
                                <Tag color="#2db7f5">Nhóm của tôi</Tag>
                            </div>
                        )}
                    </Card>
                    </Col>
                ))}
                </Row>
            </div>
        );
    };
    
    const tabItems = [
        {
            key: 'members',
            label: (
                <span>
                    <TeamOutlined /> Thành viên ({classData?.student?.length || 0})
                </span>
            ),
            children: (
                <div>
                    {isLecturer && classData?.pendingStudents?.length > 0 && (
                        <Card 
                            title={<span style={{color: '#faad14'}}>Yêu cầu tham gia ({classData.pendingStudents.length})</span>} 
                            style={{ marginBottom: 24, border: '1px solid #faad14' }}
                            styles={{ header: { backgroundColor: '#fffbe6' }}}
                            >
                            <Table 
                                dataSource={classData.pendingStudents} 
                                columns={pendingColumns} 
                                rowKey="_id" 
                                pagination={false} 
                            />
                        </Card>
                    )}
                    <Card title="Danh sách lớp chính thức" styles={{ header: { backgroundColor: '#f0f5ff' }}}>
                        <Table 
                        dataSource={classData?.student} 
                        columns={memberColumns} 
                        rowKey="_id" 
                        />
                    </Card>
                </div>
            ),
        },
        {
            key: 'groups',
            label: (
                <span>
                <ProjectOutlined /> Nhóm & Đề tài
                </span>
            ),
            children: renderProjects(),
        },
    ];

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '0 12px' }}>

            <div style={{ marginBottom: 16 }}>
                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/classes')} style={{ paddingLeft: 0 }}>
                Quay lại danh sách
                </Button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <Title level={3} style={{ margin: '8px 0' }}>{classData?.name}</Title>
                        <Text type="secondary">{classData?.semester} | Giảng viên: {classData?.lecturer?.fullName}</Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Text strong>Mã lớp: </Text>
                       <Tag color="orange" style={{ fontSize: 14, padding: '4px 8px' }}>{classData?.classCode}</Tag>
                    </div>
                </div>
            </div>

                <Tabs defaultActiveKey='projects' items={tabItems} />

                <Modal
                    title="Đăng ký Đề tài / Tạo nhóm mới"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                >
                    <Form form={form} onFinish={handleCreateProject} layout="vertical">
                    <Form.Item name="name" label="Tên đề tài" rules={[{ required: true, message: 'Nhập tên đề tài' }]}>
                        <Input placeholder="VD: Website Bán Hàng" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea rows={3} placeholder="Công nghệ sử dụng, mục tiêu..." />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Tạo nhóm</Button>
                    </Form>
                </Modal>
            </div>
    );
};

export default ClassDetailPage;