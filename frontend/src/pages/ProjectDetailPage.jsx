import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Upload, Button, Divider, Progress, message, Popconfirm, Badge, Spin, List, Drawer, Tooltip, Card, Row, Col, Tag, Avatar, Modal, Form, Input, Select, DatePicker, Dropdown, theme } from 'antd'; // Thêm theme
import { LogoutOutlined, EyeOutlined, UploadOutlined, TeamOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined, LinkOutlined, PlusOutlined, ClockCircleOutlined, EllipsisOutlined, UserOutlined, GithubOutlined, FolderOpenOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = theme.useToken(); 

    const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    const [form] = Form.useForm();
    const [submitForm] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, taskRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`)
            ]);
            setProject(projRes.data);
            setTasks(taskRes.data);
        } catch (error) {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Hàm chỉ tải lại project để cập nhật thanh % tiến độ mà không làm giật danh sách Task
    const fetchProjectDetail = async () => {
        try {
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        } catch (error) {}
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- CẬP NHẬT TRẠNG THÁI TASK ---
    const handleChangeStatus = async (taskId, newStatus) => {
        try {
            // 1. Cập nhật UI Task
            const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
            setTasks(updatedTasks);

            // 2. Tính % tiến độ
            const totalTasks = updatedTasks.length;
            const completedTasks = updatedTasks.filter(t => t.status === 'completed' || t.status === 'submitted').length;
            const newProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            // 3. ÉP CẬP NHẬT CẢ TIẾN ĐỘ VÀ TRẠNG THÁI TRÊN GIAO DIỆN
            setProject(prev => {
                let newStatusLabel = prev.status;
                if (newProgress === 100 && prev.status === 'approved') newStatusLabel = 'completed';
                else if (newProgress < 100 && prev.status === 'completed') newStatusLabel = 'approved';
                
                return { ...prev, progress: newProgress, status: newStatusLabel };
            });

            // 4. Gọi API
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            message.success('Đã cập nhật trạng thái');
            
        } catch (error) {
            message.error('Lỗi cập nhật');
            fetchData();
        }
    };

    const handleSaveTask = async (values) => {
        try {
            const payload = {
                ...values,
                projectId: id,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
            };

            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, payload);
                message.success('Đã cập nhật công việc');
            } else {
                await api.post('/tasks', payload);
                message.success('Đã thêm công việc');
            }

            setIsTaskModalOpen(false);
            setEditingTask(null);
            form.resetFields();
            fetchData(); // Tải lại toàn bộ để có % mới
        } catch (error) {
            message.error('Lỗi lưu task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            message.success('Đã xóa task');
            fetchData(); // Tải lại toàn bộ
        } catch (error) {
            message.error('Lỗi xóa task');
        }
    };

    const handleUploadFile = async (options) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file); // Chú ý: 'file' phải khớp với tên trong uploadRoutes.js của bạn

        try {
            message.loading({ content: 'Đang tải file lên, vui lòng chờ...', key: 'uploading' });
            
            // Gọi API upload (Hãy chắc chắn route trong server.js của bạn trỏ đúng vào '/upload' hoặc '/api/upload')
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Gán URL mà Cloudinary trả về vào ô input finalReportUrl của form
            submitForm.setFieldsValue({ finalReportUrl: data.url });
            
            message.success({ content: 'Tải file thành công!', key: 'uploading' });
            onSuccess("Ok");
        } catch (error) {
            message.error({ content: 'Lỗi tải file', key: 'uploading' });
            onError({ error });
        }
    };

    const handleSubmitProject = async (values) => {
        try {
            await api.put(`/projects/${id}/submit`, { finalReportUrl: values.finalReportUrl });
            message.success('Nộp báo cáo thành công!');
            setIsSubmitModalOpen(false);
            fetchData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi nộp bài');
        }
    };

    const handleRemoveMember = async (memberId) => {
    try {
        await api.delete(`/projects/${id}/members/${memberId}`);
        message.success('Thao tác thành công');
        
        // Nếu tự rời nhóm thì đá văng ra ngoài danh sách nhóm
        if (memberId === userInfo._id) {
            navigate(-1);
        } else {
            fetchProjectDetail(); // Cập nhật lại list members
        }
    } catch (error) { message.error(error.response?.data?.message || 'Lỗi'); }
    };

    const handleJoinReq = async (reqUser, action) => {
    try {
        // Lấy chính xác ID (nếu reqUser là Object thì lấy _id, nếu là chuỗi thì giữ nguyên)
        const targetUserId = typeof reqUser === 'object' ? reqUser._id : reqUser;

        await api.put('/projects/handle-request', { 
            projectId: id, 
            userId: targetUserId, // Truyền đúng ID
            action 
        });

        message.success(action === 'accept' ? 'Đã thêm thành viên' : 'Đã từ chối');
        fetchData(); // Tải lại toàn bộ dữ liệu để cập nhật mảng members và joinRequests
    } catch (error) { 
        message.error(error.response?.data?.message || 'Lỗi duyệt'); 
    }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        form.setFieldsValue({
            ...task,
            assignedTo: task.assignedTo?._id,
            dueDate: task.dueDate ? dayjs(task.dueDate) : null
        });
        setIsTaskModalOpen(true);
    };

    const showDeleteConfirm = (taskId) => {
        Modal.confirm({
            title: 'Xóa task này?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => handleDeleteTask(taskId),
        });
    };

    // Menu Dropdown của mỗi Task
    const getTaskMenuItems = (task) => {
        return [
            { key: 'edit', icon: <EditOutlined />, label: 'Sửa', onClick: () => openEditModal(task) },
            { type: 'divider' },
            { key: 'todo', label: 'Cần làm', onClick: () => handleChangeStatus(task._id, 'todo') },
            { key: 'in_progress', label: 'Đang làm', onClick: () => handleChangeStatus(task._id, 'in_progress') },
            { key: 'completed', label: 'Hoàn thành', onClick: () => handleChangeStatus(task._id, 'completed') },
            { type: 'divider' },
            { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Xóa', onClick: () => showDeleteConfirm(task._id) },
        ];
    };

    // Component Card hiển thị Task
    const TaskCard = ({ task }) => (
        <Card
            size="small"
            style={{ marginBottom: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: token.colorBgContainer }}
            hoverable
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Text strong
                    style={{ fontSize: 14, cursor: 'pointer', flex: 1 }}
                    onClick={() => openEditModal(task)}
                >
                    {task.title}
                </Text>

                <Dropdown menu={{ items: getTaskMenuItems(task) }} trigger={['click']}>
                    <Button type="text" size="small" icon={<EllipsisOutlined />} />
                </Dropdown>
            </div>

            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 12, margin: '8px 0' }}>
                {task.description}
            </Paragraph>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Tooltip title={`Được giao cho: ${task.assignedTo?.fullName}`}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size={24} src={task.assignedTo?.avatarUrl || undefined} icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                    </div>
                </Tooltip>
                {task.dueDate && (
                    <Tag style={{ marginRight: 0 }} icon={<ClockCircleOutlined />} color={dayjs(task.dueDate).isBefore(dayjs()) ? "error" : "processing"}>
                        {dayjs(task.dueDate).format('DD/MM')}
                    </Tag>
                )}
            </div>
        </Card>
    );

    // Component Cột Kanban
    const TaskColumn = ({ title, status, color, list }) => (
        <Col span={8} style={{ height: '100%' }}>
            <div style={{ background: token.colorFillAlter, padding: 12, borderRadius: 8, minHeight: 500 }}>
                <div style={{ marginBottom: 12, fontWeight: 'bold', color: token.colorTextSecondary, display: 'flex', alignItems: 'center' }}>
                    <Tag color={color} style={{ marginRight: 8 }}>{list.length}</Tag>
                    {title}
                </div>
                {list.map(task => <TaskCard key={task._id} task={task} />)}
            </div>
        </Col>
    );

    if (loading && !project) return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '0 12px', minHeight: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ marginBottom: 16 }}>
                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>Quay lại</Button>
            </div>

            {/* HEADER MỚI: CÓ THANH TIẾN ĐỘ */}
            <Card style={{ marginBottom: 24, borderRadius: 8, background: token.colorBgContainer }}>
                <Row justify="space-between" align="middle" gutter={16}>
                    <Col xs={24} md={14}>
                        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FolderOpenOutlined style={{ color: '#1890ff' }} />
                            {project?.name}
                            {project?.finalReportUrl && <Tooltip title="Đã nộp báo cáo"><LinkOutlined style={{ color: 'green', fontSize: 18 }} /></Tooltip>}
                        </Title>
                        
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ marginRight: 16 }}>
                                <UserOutlined /> Trưởng nhóm: <Text strong>{project?.leader?.fullName}</Text>
                            </Text>
                            <Tag color={project?.status === 'completed' ? 'success' : project?.status === 'approved' ? 'processing' : 'warning'}>
                                {project?.status === 'completed' ? 'Hoàn thành' : project?.status === 'approved' ? 'Đang thực hiện' : 'Chờ duyệt'}
                            </Tag>
                        </div>
                        
                        {project?.description && (
                            <Paragraph style={{ marginTop: 8, marginBottom: 0, color: token.colorTextSecondary }}>
                                {project.description}
                            </Paragraph>
                        )}
                    </Col>

                    <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Tiến độ hoàn thành dự án</Text>
                        <Progress
                            percent={project?.progress || 0}
                            status={project?.progress === 100 ? 'success' : 'active'}
                            strokeWidth={14}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </Col>
                </Row>
                
                {/* NÚT THAO TÁC */}
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    
                    {/* Các nút của Trưởng Nhóm */}
                    {userInfo._id === project?.leader?._id ? (
                        <>
                            <Button icon={<TeamOutlined />} onClick={() => setIsMemberDrawerOpen(true)}>
                                Quản lý thành viên 
                                {/* Hiện chấm đỏ nếu có người xin vào */}
                                {project?.joinRequests?.length > 0 && <Badge dot style={{marginLeft: 5}}/>}
                            </Button>
                            <Button icon={<GithubOutlined />} onClick={() => setIsSubmitModalOpen(true)}>
                                Nộp Báo Cáo
                            </Button>
                        </>
                    ) : (
                        /* Nút Rời Nhóm cho thành viên bình thường (GV không thấy nút này) */
                        userInfo.role !== 'lecturer' && (
                            <Popconfirm title="Bạn chắc chắn muốn rời nhóm?" onConfirm={() => handleRemoveMember(userInfo._id)}>
                                <Button danger icon={<LogoutOutlined />}>Rời Nhóm</Button>
                            </Popconfirm>
                        )
                    )}

                    {project?.finalReportUrl && (
                        <Button 
                            type="primary" 
                            ghost 
                            icon={<EyeOutlined />} 
                            onClick={() => window.open(project.finalReportUrl, '_blank')} // Mở link ở Tab mới
                        >
                            Xem Báo Cáo
                        </Button>
                    )}

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); form.resetFields(); setIsTaskModalOpen(true); }}>
                        Thêm Công Việc Mới
                    </Button>
                </div>
            </Card>

            {/* BOARD KANBAN */}
            <Row gutter={16} style={{ flex: 1 }}>
                <TaskColumn title="CẦN LÀM" status="todo" color="orange" list={tasks.filter(t => t.status === 'todo')} />
                <TaskColumn title="ĐANG LÀM" status="in_progress" color="blue" list={tasks.filter(t => t.status === 'in_progress')} />
                <TaskColumn title="HOÀN THÀNH" status="completed" color="green" list={tasks.filter(t => t.status === 'completed' || t.status === 'submitted')} />
            </Row>

            <Modal title={editingTask ? "Chỉnh sửa công việc" : "Giao việc mới"} open={isTaskModalOpen} onCancel={() => setIsTaskModalOpen(false)} footer={null}>
                <Form form={form} onFinish={handleSaveTask} layout="vertical">
                    <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="assignedTo" label="Giao cho">
                                <Select showSearch optionFilterProp="children">
                                    {project?.members?.map(mem => <Option key={mem._id} value={mem._id}>{mem.fullName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dueDate" label="Hạn chót">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" block>Lưu lại</Button>
                </Form>
            </Modal>

            <Modal
                title="Nộp Báo Cáo"
                open={isSubmitModalOpen}
                onCancel={() => setIsSubmitModalOpen(false)}
                footer={null}
            >
                <Form form={submitForm} onFinish={handleSubmitProject} layout="vertical" initialValues={{ finalReportUrl: project?.finalReportUrl }}>
                    
                    <Form.Item label="Cách 1: Tải file từ máy tính (PDF, ZIP, DOCX...)">
                        <Upload 
                            customRequest={handleUploadFile} 
                            maxCount={1} // Chỉ cho phép up 1 file, up file khác sẽ đè lên
                            showUploadList={{ showRemoveIcon: false }} // Ẩn nút xóa mặc định để tránh lỗi logic
                        >
                            <Button icon={<UploadOutlined />}>Chọn File tải lên</Button>
                        </Upload>
                    </Form.Item>

                    <div style={{ textAlign: 'center', margin: '16px 0', color: '#bfbfbf', fontWeight: 'bold' }}>- HOẶC -</div>

                    
                    <Form.Item 
                        name="finalReportUrl" 
                        label="Cách 2: Link Repository (Github/Gitlab) hoặc Google Drive" 
                        rules={[
                            { required: true, message: 'Vui lòng tải file lên hoặc nhập link' }, 
                            { type: 'url', message: 'Link không hợp lệ' }
                        ]}
                    >
                        <Input prefix={<LinkOutlined />} placeholder="https://..." />
                    </Form.Item>
                    
                    <Button type="primary" htmlType="submit" block size="large">Xác nhận nộp</Button>
                </Form>
            </Modal>
            <Drawer 
                title="Quản lý thành viên" 
                placement="right" 
                onClose={() => setIsMemberDrawerOpen(false)} 
                open={isMemberDrawerOpen}
            >
                {/* Danh sách xin vào */}
                {project?.joinRequests?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <Text type="warning" strong>Yêu cầu tham gia ({project.joinRequests.length})</Text>
                        <List
                            itemLayout="horizontal"
                            dataSource={project.joinRequests}
                            renderItem={(reqUser) => (
                                <List.Item
                                    actions={[
                                        <Button size="small" type="primary" onClick={() => handleJoinReq(reqUser, 'accept')}>Nhận</Button>,
                                        <Button size="small" danger type="text" onClick={() => handleJoinReq(reqUser, 'reject')}>Từ chối</Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={<Text>{reqUser.fullName}</Text>} 
                                    />
                                </List.Item>
                            )}
                        />
                        <Divider />
                    </div>
                )}

                {/* Danh sách thành viên hiện tại */}
                <Text strong>Thành viên chính thức ({project?.members?.length})</Text>
                <List
                    itemLayout="horizontal"
                    dataSource={project?.members}
                    renderItem={(member) => (
                        <List.Item
                            actions={
                                member._id === project.leader._id 
                                ? [<Tag color="gold">Leader</Tag>]
                                : [
                                    <Popconfirm title="Kick người này?" onConfirm={() => handleRemoveMember(member._id)}>
                                        <Button size="small" danger type="text">Kick</Button>
                                    </Popconfirm>
                                  ]
                            }
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={member.avatarUrl} icon={<UserOutlined />} />}
                                title={member.fullName}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
        </div>
    );
};

export default ProjectDetailPage;