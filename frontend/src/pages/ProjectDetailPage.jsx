import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, message, Spin, Card, Row, Col ,Tag, Avatar, Modal, Form, Input, Select, DatePicker, Dropdown, Menu } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, ClockCircleOutlined, CheckCircleOutlined, EllipsisOutlined, UserOutlined, GithubOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ProjectDetailPage = () => {
    const { id } = useParmas();
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
            setLoading(fasle);
        }
    };

    const fetchProjectDetail = async () => {
        try{
            const { data } = await api.get(`/projects/${id}`);
            setProject(data);
        }catch(error){

        }
    };

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

    
}