import React, { useState, useEffect } from 'react';
import { Button, Card, List, Typography, Modal, Form, Input, message, Tag, Row,Col, Statistic} from 'antd';
import { PlusOutlined ,UserOutlined, CopyOutlined, TeamOutlined, UsergroupAddOutlined} from '@ant-design/icons';
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

return (
    <div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
            <Title level={2}>Lớp Đồ Án Của Tôi</Title>
            <Button
            type="primary"
            icon={isLecturer ? <PlusOutlined/> : <UsergroupAddOutlined/>}
            size="large"
            onClick={() => setIsModalOpen(true)}
            >
                {isLecturer ? 'Taoj Lớp Mới' : 'Tham Gia Lớp'}
            </Button>
        </div>

        <List
        grid = {{ gutter: 16, xs: 1, sm: 2, md: 3,lg: 3, xl: 4 }}
        loading={loading}
        dataSource={classes}
        renderItem={(item) => (
            <List.Item>
                <Card
                hoverable
                title={<Text strong style={{fontSize: 16}}>{item.name}</Text>}
                extra={[
                    <Button type="link" onClick={() => message.info('Chức năng chi tiết lớp ')}>
                        Truy cập
                    </Button>
                ]}
                style={{ borderRadius: 8, overflow: 'hidden'}}
                styles={{
                    background: '#f0f5ff',
                    borderBottom: '1px solid #d6eff'
                }}
                >
                    <div style={{ minHeight: 80 }}>
                        {item.description && <p style={{ color: '#8c8c8c', marginBottom: 12}}>{item.description}</p>}

                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                title="Thành viên"
                                value={item.students.length}
                                prefix={<TeamOutlined/>}
                                styles={{ 
                                    content:{fontSize: 16}
                                }}
                                />
                            </Col>
                            
                            <Col span={12}>
                                <div style={{ display: 'flex', flexDirection: 'column'}}>
                                    <Text Type="secondary" style={{ fontSize: 12}}>
                                        Mã tham gia
                                    </Text>

                                    <Tag
                                    icon={<CopyOutlined />}
                                    color="warning"
                                    style={{ cursor: 'pointer', width: 'fit-content', marginTop: 4}}
                                    onClick={() => copyToClipboard(item.classCode)}
                                    >
                                        {item.classCode}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
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
                <Form onFinish={handleCreateClass} layout="vertical">
                    <Form.Item name="name" label="Tên lớp" rules={[{ required: true, message: 'Nhập tên lớp'}]}>
                        <Input placeholder="VD: Đồ Án Cơ Sở" />
                    </Form.Item>
                    <Form.Item name="semester" label="Học kỳ" rules={[{ required: true, message: 'Nhập học kỳ' }]}>
                        <Input placeholder="VD: HK1-2024" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Thông tin thêm..." />
                    </Form.Item>
                        <Button type="primary" htmlType="submit" block>Tạo ngay</Button>
                    </Form>
            ) : (
                <Form onFinish={handleJoinClass} layout="vertical">
                    <Form.Item name="classCode" label="Nhập mã lớp" rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}>
                        <Input placeholder="Mã 6 ký tự do giảng viên cung cấp" size="large" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Gửi yêu cầu</Button>
                </Form>
            ) }
        </Modal>
    </div>
);

};
export default ClassPage;