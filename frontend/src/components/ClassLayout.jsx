import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Typography, Spin, Breadcrumb, message, Button, theme } from 'antd';
import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  HomeOutlined, 
  TeamOutlined, 
  BulbOutlined, 
  ProjectOutlined, 
  FileTextOutlined, 
  FolderOpenOutlined, 
  BarChartOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../api';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const ClassLayout = () => {
  const { id } = useParams(); // Lấy Class ID
  const navigate = useNavigate();
  const location = useLocation();
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme tokens
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // --- 1. LẤY THÔNG TIN LỚP ---

    const fetchClassInfo = useCallback(async () => {
      try {
        const { data } = await api.get(`/classes/${id}`);
        setClassData(data);
      } catch (error) {
        message.error("Không thể truy cập lớp học này");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    },[id, navigate]);

    useEffect(() => {
    fetchClassInfo();
    }, [fetchClassInfo]);

  // --- 2. CẤU HÌNH MENU ---
  const menuItems = [
    { key: '', icon: <HomeOutlined />, label: 'Bảng tin' }, // Path mặc định
    { key: 'people', icon: <TeamOutlined />, label: 'Thành viên' },
    { key: 'topics', icon: <BulbOutlined />, label: 'Đề tài' },
    { key: 'groups', icon: <ProjectOutlined />, label: 'Nhóm' },
    { key: 'assignments', icon: <FileTextOutlined />, label: 'Bài tập / Nộp bài' },
    { key: 'materials', icon: <FolderOpenOutlined />, label: 'Tài liệu' },
    { key: 'grades', icon: <BarChartOutlined />, label: 'Sổ điểm' },
  ];

  // Xử lý active menu dựa trên URL hiện tại
  const currentKey = location.pathname.split('/').pop() === id ? '' : location.pathname.split('/').pop();

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}> {/* Trừ đi chiều cao Header chính */}
      
      {/* SIDEBAR LỚP HỌC (Menu con) */}
      <Sider width={220} style={{ background: colorBgContainer }}>
        <div style={{ padding: '16px 16px 0 16px' }}>
             <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/classes')} style={{marginBottom: 8}}>
                 DS Lớp
             </Button>
             <Title level={5} style={{ margin: 0 }} ellipsis={{ tooltip: classData?.name }}>
                {classData?.name}
             </Title>
             <Text type="secondary" style={{ fontSize: 12 }}>{classData?.classCode}</Text>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          style={{ height: '100%', borderRight: 0, marginTop: 16 }}
          items={menuItems}
          onClick={(e) => {
             // Logic ghép URL: /classes/:id + /key
             const path = e.key === '' ? `/classes/${id}` : `/classes/${id}/${e.key}`;
             navigate(path);
          }}
        />
      </Sider>

      {/* NỘI DUNG CHÍNH (Thay đổi theo menu) */}
      <Layout style={{ padding: '0 24px 24px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><Link to="/dashboard">Home</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/classes">Lớp học</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{classData?.name}</Breadcrumb.Item>
            <Breadcrumb.Item>{menuItems.find(i => i.key === currentKey)?.label}</Breadcrumb.Item>
        </Breadcrumb>
        
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Đây là nơi các trang con (Stream, Assignments...) sẽ hiển thị */}
          {/* Truyền classData xuống các con để không phải gọi API lại */}
          <Outlet context={{ classData, refetchClass: fetchClassInfo }} /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClassLayout;