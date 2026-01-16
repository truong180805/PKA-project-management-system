import React , { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Tabs, Table, Typography, Tag, Button, Spin, message, Card, Popconfirm, Breadcrumb } from 'antd';
import { CheckCircleOutlined, TeamOutlined, UserOutlined,CloseCircleOutlined, ProjectOutlined, ArrowLeftOutlined  } from '@ant-design/icons';
import api from '../api';

const { Title, Text } = Typography;

const ClassDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    const handleApprove = async (studentId, isApproved) => {
        try {
            await api.put(`/classes/${id}/approve`, { studentId, isApproved });
            message.success(isApproved ? 'Đã duyệt sinh viên' : 'Đã từ chối yêu cầu');
            fetchClassDetails();
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại');
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
                    onClick={() => handleApprove(record._id, true)}
                    >
                        Duyệt
                    </Button>
                    <Popconfirm
                        title="Từ chối sinh viên này?"
                        onConfirm={() => handleApprove(record._id, false)}
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

    const  tabItems = [
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
            children: (
                <div style={{ textAlign: 'center', padding: 50 }}>
                <Text type="secondary">Chức năng quản lý Nhóm/Đề tài sẽ được xây dựng ở bước tiếp theo.</Text>
                </div>
            ),
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

        <Tabs defaultActiveKey="members" items={tabItems} />
        </div>
    );
};

export default ClassDetailPage;