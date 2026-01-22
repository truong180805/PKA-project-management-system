import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, Spin, Card, Row, Col ,Tag, Avatar, Modal, Form, Input, Select, DatePicker, Dropdown, Menu } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, EllipsisOutlined, UserOutlined, GithubOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [form] = Form.useForm();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const fetchData = async () => {
        setLoading(true);

        try{
            const taskRes = await api.get(`/tasks/project/${id}`);
            setTasks(taskRes.data);
        } catch (error) {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetail = async () => {
        try{
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        }catch(error){

        }
    };

    useEffect(() => {
        fetchProjectDetail();
        fetchData();
    }, [id]);

    const handleCreateTask = async (values) => {
        try {
            await api.post('/tasks', {
                ...values,
                projectId: id,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
            });

            message.success('Đã thêm công việc');
            setIsModalOpen(false);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('Lỗi tạo task');
            fetchData();
        }
    };

    const handleChangeStatus = async (taskId, newStatus) => {
        try{
            const updatedTasks = tasks.map(t => t._id === taskId ? {...t, status: newStatus } : t);
            setTasks(updatedTasks);

            await api.put(`/tasks/${taskId}`, { status: newStatus });
            message.success('Đã cập nhập trạng thái');

        } catch(error){
            message.error('Lỗi cập nhập');
            fetchData();
        }
    };

    const TaskColumn = ({ title, status, color, taskList }) => (
        <Col span={8}>
            <Card
            title={<Tag color={color} 
            style={{fontSize: 14, padding: '4px 10px'}}>{title} ({taskList.length})</Tag>}
            styles={{
                body:{
                    padding: 10,
                    minHeight: 400
                }
            }}
            >
                {taskList.map(task => (
                    <Card
                    key = {task._id}
                    size="small"
                    style={{ marginBottom: 10, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    hoverable
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <Text strong style={{ fontSize: 15 }}>{task.title}</Text>

                            <Dropdown
                            menu={{
                                items: [
                                { key: 'todo', label: 'Cần làm' },
                                { key: 'in_progress', label: 'Đang làm' },
                                { key: 'completed', label: 'Hoàn thành' },
                                ],
                                onClick: ({ key }) => handleChangeStatus(task._id, key),
                            }}
                            >
                            <span>
                                <EllipsisOutlined
                                style={{ fontSize: 20, transform: 'rotate(90deg)', cursor: 'pointer' }}
                                />
                            </span>
                            </Dropdown>

                        </div>

                        <Paragraph  type="secondary" 
                                    ellipsis={{ rows:2 }} 
                                    style={{ fontSize: 12, margin: '8px 0'}}
                        >
                            {task.description}
                        </Paragraph>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12}}>
                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                <Avatar size="small" 
                                        src={task.assignedTo?.avatarUrl || null}
                                        icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} 
                                />

                                <Text   type='secondary'
                                        style={{fontSize: 11, marginLeft: 6}}
                                >{task.assignedTo?.fullName?.split(' ').pop()}</Text>
                            </div>
                            {task.dueDate && (
                                <Tag icon={<ClockCircleOutlined />} color={dayjs(task.dueDate).isBefore(dayjs()) ? "red" : "blue"}>
                                    {dayjs(task.dueDate).format('DD/MM')}
                                </Tag>
                            )}
                        </div>
                    </Card>
                ))}
            </Card>
        </Col>
    );

    return (
        <div style={{ padding: '0 12px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>
                Quay lại lớp
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>{project?.name || "Đang tải..."}</Title>
                    <Text type="secondary">Leader: {project?.leader?.fullName}</Text>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {/* Nút nộp bài (Dành cho Leader - Tính sau) */}
                    <Button icon={<GithubOutlined />}>Nộp báo cáo</Button>
                    
                    {/* Nút tạo task */}
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Thêm công việc
                    </Button>
                </div>
            </div>
        </div>

        {/* KANBAN BOARD */}
        <Row gutter={16}>
            <TaskColumn 
                title="Cần làm (Todo)" 
                status="todo" 
                color="orange" 
                taskList={tasks.filter(t => t.status === 'todo')} 
            />
            <TaskColumn 
                title="Đang thực hiện" 
                status="in_progress" 
                color="blue" 
                taskList={tasks.filter(t => t.status === 'in_progress')} 
            />
            <TaskColumn 
                title="Đã xong" 
                status="completed" 
                color="green" 
                taskList={tasks.filter(t => t.status === 'completed' || t.status === 'submitted')} 
            />
        </Row>

        {/* MODAL TẠO TASK */}
        <Modal
            title="Giao việc mới"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
        >
            <Form form={form} onFinish={handleCreateTask} layout="vertical">
                <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}>
                    <Input placeholder="VD: Thiết kế Database" />
                </Form.Item>
                <Form.Item name="description" label="Mô tả chi tiết">
                    <Input.TextArea rows={3} />
                </Form.Item>
                
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="assignedTo" label="Giao cho">
                            <Select placeholder="Chọn thành viên">
                                {project?.members?.map(mem => (
                                    <Option key={mem._id} value={mem._id}>{mem.fullName}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dueDate" label="Hạn chót">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Button type="primary" htmlType="submit" block>Tạo Task</Button>
            </Form>
        </Modal>
        </div>
    );

};

export default ProjectDetailPage;