import React, { useState, useEffect } from 'react';
import { Table, Typography, Tag, Space, Button, message, Popconfirm, Select, Input, Card } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined, SafetyOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchUsers = async (keyword = '') => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users?keyword=${keyword}`);
            setUsers(data);
        } catch (error) { message.error('Lỗi tải danh sách người dùng'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Đổi role
    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            message.success('Đã cập nhật vai trò');
            fetchUsers();
        } catch (error) { message.error('Lỗi cập nhật'); }
    };

    // Xóa user
    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/users/${userId}`);
            message.success('Đã xóa người dùng');
            fetchUsers();
        } catch (error) { message.error(error.response?.data?.message || 'Lỗi xóa người dùng'); }
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                </Space>
            )
        },
        {
            title: 'SĐT / MSSV',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.numberPhone}</Text>
                    {record.studentId && <Text type="secondary" style={{ fontSize: 12 }}>MSSV: {record.studentId}</Text>}
                </Space>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role, record) => (
                <Select 
                    value={role} 
                    style={{ width: 120 }} 
                    disabled={role === 'admin'} // Không cho tự đổi quyền admin của mình
                    onChange={(val) => handleRoleChange(record._id, val)}
                >
                    <Option value="student"><Tag color="blue">Sinh viên</Tag></Option>
                    <Option value="lecturer"><Tag color="gold">Giảng viên</Tag></Option>
                    <Option value="admin" disabled><Tag color="red">Admin</Tag></Option>
                </Select>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Popconfirm 
                        title="Bạn có chắc chắn muốn xóa tài khoản này?" 
                        onConfirm={() => handleDeleteUser(record._id)}
                        disabled={record.role === 'admin'}
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} disabled={record.role === 'admin'}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '0 12px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}><SafetyOutlined /> Quản trị người dùng</Title>
                    <Text type="secondary">Quản lý toàn bộ tài khoản trong hệ thống</Text>
                </div>
            </div>

            <Card bordered={false}>
                <Input.Search 
                    placeholder="Tìm kiếm theo Tên hoặc Email..." 
                    allowClear 
                    enterButton={<SearchOutlined />} 
                    size="large"
                    onSearch={fetchUsers}
                    style={{ maxWidth: 400, marginBottom: 20 }}
                />

                <Table 
                    columns={columns} 
                    dataSource={users} 
                    rowKey="_id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default AdminUsersPage;