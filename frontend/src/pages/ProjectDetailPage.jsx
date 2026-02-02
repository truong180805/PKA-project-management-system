import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, message, Spin, Popconfirm, Tooltip, Card, Row, Col ,Tag, Avatar, Modal, Form, Input, Select, DatePicker, Dropdown, Menu } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, LinkOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, EllipsisOutlined, UserOutlined, GithubOutlined } from '@ant-design/icons';
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
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    const [form] = Form.useForm();
    const [submitForm] = Form.useForm();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const fetchData = async () => {
        setLoading(true);

        try{
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

    const fetchProjectDetail = async () => {
        try{
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        }catch(error){

        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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

    const handleSaveTask = async (values) => {
        try {
        const payload = {
            ...values,
            projectId: id,
            dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
        };

        if (editingTask) {
            // Update
            await api.put(`/tasks/${editingTask._id}`, payload);
            message.success('Đã cập nhật công việc');
        } else {
            // Create
            await api.post('/tasks', payload);
            message.success('Đã thêm công việc');
        }
        
        setIsTaskModalOpen(false);
        setEditingTask(null);
        form.resetFields();
        fetchData();
        } catch (error) {
        message.error('Lỗi lưu task');
        }
    };

    const handleDeleteTask = async (taskId) => {
      try {
          await api.delete(`/tasks/${taskId}`);
          message.success('Đã xóa task');
          fetchData();
      } catch (error) {
          message.error('Lỗi xóa task');
      }
    }

    const handleSubmitProject = async (values) => {
      try {
          await api.put(`/projects/${id}/submit`, { finalReportUrl: values.finalReportUrl });
          message.success('Nộp báo cáo thành công!');
          setIsSubmitModalOpen(false);
          fetchData();
      } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi nộp bài');
      }
    }

    const openEditModal = (task) => {
      setEditingTask(task);
      form.setFieldsValue({
          ...task,
          assignedTo: task.assignedTo?._id,
          dueDate: task.dueDate ? dayjs(task.dueDate) : null
      });
      setIsTaskModalOpen(true);
    }

     const showDeleteConfirm = (taskId) => {
    Modal.confirm({
        title: 'Xóa task này?',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: () => handleDeleteTask(taskId),
    });
    };

    const getTaskMenuItems = (task) => [
  {
    key: 'edit',
    icon: <EditOutlined />,
    label: 'Sửa',
    onClick: () => openEditModal(task),
  },
  {
    type: 'divider',
  },
  {
    key: 'todo',
    label: 'Cần làm',
    onClick: () => handleChangeStatus(task._id, 'todo'),
  },
  {
    key: 'in_progress',
    label: 'Đang làm',
    onClick: () => handleChangeStatus(task._id, 'in_progress'),
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    onClick: () => handleChangeStatus(task._id, 'completed'),
  },
  {
    type: 'divider',
  },
  {
    key: 'delete',
    icon: <DeleteOutlined />,
    danger: true,
    label: 'Xóa',
    onClick: () => showDeleteConfirm(task._id),
  },
];

    const TaskCard = ({ task }) => (
    <Card 
        size="small"
        style={{ marginBottom: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
        hoverable
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Text strong 
                style={{ fontSize: 14, cursor: 'pointer', flex: 1 }} 
                onClick={() => openEditModal(task)} // Bấm vào tên để sửa
            >
                {task.title}
            </Text>
            
            <Dropdown
            menu={{ items: getTaskMenuItems(task) }}
            trigger={['click']}
            >
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
                <Tag style={{marginRight: 0}} icon={<ClockCircleOutlined />} color={dayjs(task.dueDate).isBefore(dayjs()) ? "red" : "blue"}>
                    {dayjs(task.dueDate).format('DD/MM')}
                </Tag>
            )}
        </div>
    </Card>
    );

    const TaskColumn = ({ title, status, color, list }) => (
    <Col span={8} style={{ height: '100%' }}>
      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, minHeight: 500 }}>
         <div style={{ marginBottom: 12, fontWeight: 'bold', color: '#595959', display: 'flex', alignItems: 'center' }}>
             <Tag color={color} style={{ marginRight: 8 }}>{list.length}</Tag> 
             {title}
         </div>
         {list.map(task => <TaskCard key={task._id} task={task} />)}
      </div>
    </Col>
    );

    return (
    <div style={{ padding: '0 12px', height: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0 }}>Quay lại</Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Title level={3} style={{ margin: 0 }}>
                    {project?.name} 
                    {project?.finalReportUrl && <Tooltip title="Đã nộp báo cáo"><LinkOutlined style={{color: 'green', marginLeft: 10}} /></Tooltip>}
                </Title>
                <Text type="secondary">Leader: {project?.leader?.fullName}</Text>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                {/* Chỉ Leader mới thấy nút Nộp báo cáo */}
                {userInfo._id === project?.leader?._id && (
                    <Button icon={<GithubOutlined />} onClick={() => setIsSubmitModalOpen(true)}>
                        {project?.finalReportUrl ? 'Cập nhật Link' : 'Nộp báo cáo'}
                    </Button>
                )}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTask(null); form.resetFields(); setIsTaskModalOpen(true); }}>
                    Thêm việc
                </Button>
            </div>
        </div>
      </div>

      {/* BOARD */}
      <Row gutter={16} style={{ flex: 1, overflowY: 'hidden' }}>
        <TaskColumn title="CẦN LÀM" status="todo" color="orange" list={tasks.filter(t => t.status === 'todo')} />
        <TaskColumn title="ĐANG LÀM" status="in_progress" color="blue" list={tasks.filter(t => t.status === 'in_progress')} />
        <TaskColumn title="HOÀN THÀNH" status="completed" color="green" list={tasks.filter(t => t.status === 'completed' || t.status === 'submitted')} />
      </Row>

      {/* MODAL TẠO/SỬA TASK */}
      <Modal
        title={editingTask ? "Chỉnh sửa công việc" : "Giao việc mới"}
        open={isTaskModalOpen}
        onCancel={() => setIsTaskModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSaveTask} layout="vertical">
            <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
            </Form.Item>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="assignedTo" label="Giao cho">
                        <Select showSearch optionFilterProp="children">
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
            <Button type="primary" htmlType="submit" block>Lưu lại</Button>
        </Form>
      </Modal>

      {/* MODAL NỘP BÁO CÁO */}
      <Modal
        title="Nộp Đồ Án / Báo Cáo"
        open={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}
        footer={null}
      >
          <Form form={submitForm} onFinish={handleSubmitProject} layout="vertical" initialValues={{ finalReportUrl: project?.finalReportUrl }}>
              <Form.Item 
                name="finalReportUrl" 
                label="Link Repository (Github/Gitlab) hoặc Google Drive" 
                rules={[{ required: true, message: 'Vui lòng nhập link' }, { type: 'url', message: 'Link không hợp lệ'}]}
              >
                  <Input prefix={<LinkOutlined />} placeholder="https://github.com/..." />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>Xác nhận nộp</Button>
          </Form>
      </Modal>
    </div>
  );

};

export default ProjectDetailPage;