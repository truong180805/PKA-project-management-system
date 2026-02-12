import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Typography, Avatar, Row, Col, List, Tag, Button } from 'antd';
import { ReadOutlined, BellOutlined, FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ClassStreamPage = () => {
  const { classData } = useOutletContext();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // Dữ liệu giả lập cho timeline (Sau này sẽ lấy từ API Dashboard của lớp)
  const activities = [
    {
      title: 'Giảng viên đã đăng một bài tập mới: "Báo cáo tiến độ Giai đoạn 1"',
      time: '2 giờ trước',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      type: 'assignment'
    },
    {
      title: `Chào mừng đến với lớp ${classData?.name}`,
      time: '1 ngày trước',
      icon: <InfoCircleOutlined style={{ color: '#52c41a' }} />,
      type: 'info'
    }
  ];

  return (
    <div>
      {/* BANNER LỚP HỌC */}
      <div 
        style={{
            height: 200,
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
            borderRadius: 8,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            marginBottom: 24,
            color: 'white',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Title level={2} style={{ color: 'white', margin: 0 }}>{classData?.name}</Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            {classData?.semester} | Mã lớp: <Tag color="orange">{classData?.classCode}</Tag>
        </Text>
      </div>

      <Row gutter={24}>
        {/* CỘT TRÁI: THÔNG BÁO NGẮN */}
        <Col xs={24} md={6}>
            <Card title="Sắp đến hạn" size="small" style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
                    <Text>Tuyệt vời, không có bài tập nào cần nộp gấp!</Text>
                </div>
                <Button type="link" block>Xem tất cả</Button>
            </Card>
            
            <Card title="Thông tin" size="small">
                <Paragraph ellipsis={{ rows: 3 }}>
                    {classData?.description || "Không có mô tả thêm."}
                </Paragraph>
                <div style={{ marginTop: 10 }}>
                    <Text type="secondary"><ReadOutlined /> {classData?.department || 'Khoa CNTT'}</Text>
                </div>
            </Card>
        </Col>

        {/* CỘT PHẢI: BẢNG TIN HOẠT ĐỘNG */}
        <Col xs={24} md={18}>
            {/* Khu vực đăng bài (Chỉ GV - Placeholder) */}
            <Card 
                style={{ marginBottom: 24, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                styles={{ body: { display: 'flex', alignItems: 'center', gap: 15 } }}
            >
                <Avatar src={userInfo.avatarUrl} icon={<ReadOutlined />} size="large" style={{ backgroundColor: '#1890ff' }} />
                <div 
                    style={{ 
                        flex: 1, 
                        background: '#f0f2f5', 
                        padding: '12px 20px', 
                        borderRadius: 20, 
                        color: '#8c8c8c',
                        cursor: 'pointer' 
                    }}
                >
                    {userInfo.role === 'lecturer' ? 'Thông báo nội dung nào đó cho lớp...' : 'Chia sẻ với lớp học...'}
                </div>
            </Card>

            {/* Danh sách hoạt động */}
            <Title level={5} style={{ marginBottom: 16, color: '#595959' }}><BellOutlined /> Hoạt động gần đây</Title>
            
            <List
                itemLayout="horizontal"
                dataSource={activities}
                renderItem={item => (
                    <Card style={{ marginBottom: 16 }} hoverable>
                        <List.Item.Meta
                            avatar={
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: '50%', background: '#e6f7ff', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 
                                }}>
                                    {item.icon}
                                </div>
                            }
                            title={<a href="#">{item.title}</a>}
                            description={item.time}
                        />
                    </Card>
                )}
            />
        </Col>
      </Row>
    </div>
  );
};

export default ClassStreamPage;