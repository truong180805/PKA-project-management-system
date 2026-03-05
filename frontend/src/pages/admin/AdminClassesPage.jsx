import React, { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Typography, Card, Tag } from 'antd';
import { DeleteOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const AdminClassesPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllClasses = async () => {
        setLoading(true);
        try {
            // Bạn cần tạo 1 API backend: GET /api/classes/admin/all
            const { data } = await api.get(`/classes/admin/all`); // Tạm thời dùng API lấy lớp chung
            setClasses(data);
        } catch (error) { message.error('Lỗi tải danh sách lớp'); }
        finally { setLoading(false); }
    };

    const handleDeleteClass = async (id) => {
        try {
            await api.delete(`/classes/admin/${id}`); // Giả sử route xóa lớp đã có
            message.success('Đã xóa lớp học');
            fetchAllClasses();
        } catch (error) { message.error('Không thể xóa lớp này'); }
    };

    useEffect(() => { fetchAllClasses(); }, []);

    const columns = [
        { title: 'Tên lớp', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
        { title: 'Giảng viên', dataIndex: 'lecturer', render: (l) => l?.fullName || 'N/A' },
        { title: 'Sĩ số', dataIndex: 'student', render: (s) => <Tag color="blue">{s?.length} SV</Tag> },
        { 
            title: 'Hành động', 
            key: 'action', 
            render: (_, record) => (
                <Popconfirm title="Xóa lớp học này?" onConfirm={() => handleDeleteClass(record._id)}>
                    <Button danger type="text" icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <Card title={<Title level={3}><BookOutlined /> Quản lý Lớp học</Title>}>
            <Table dataSource={classes} columns={columns} rowKey="_id" loading={loading} />
        </Card>
    );
};

export default AdminClassesPage;