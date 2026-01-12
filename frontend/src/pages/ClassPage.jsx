import React, { useState, useEffect } from 'react';
import { Button, Card, List, Typography, Modal, Form, Input, message, Tag, Row,Col, Statistic} from 'antd';
import { PlusOutlined ,UserOutlined, CopyOutlined, TeamOutlined} from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

const ClassPage = () => {   
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

//take infor user (lect/stu)
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
const isLecturer = userInfo?.role === 'lecturer';

//take infor classes
const fetchClasses = async () => {
    setLoading(true);
    try {
        const { data } = await api.get('/classes');
        setClasses(data);
    } catch(error){
        message.error('Không thể tải danh sách lớp');
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchClasses();
}, []);

const handleCreateClass = async (values) =>{
    try{
        await api.post('/classes', values);
        message.success('Tạo lớp thành công');
        setIsModalOpen(false);
        fetchClasses();
    } catch(error){ 
        message.error(error.response?.data?.message || 'Tạo lớp thất bại');
    }
};

const handleJoinClass = async (values) => {
    try{
        const { data } = await api.post('/classes/join', values);
        
        if (data.status === 'joined') {
            message.success(data.message);
        } else {
            message.info(data.message);
        }
        setIsModalOpen(false);
        fetchClasses;
    } catch(error){
        message.error(error.response?.data?.message || 'Không thể tham gia lớp');
    }
};

const copyToClipboard = (text) =>{
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép mã lớp!');
};

};
export default ClassPage;