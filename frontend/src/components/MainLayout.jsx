import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Typography, Space, Badge } from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined, 
  DashboardOutlined, ReadOutlined, 
  ProjectOutlined, CalendarOutlined, 
  MessageOutlined, SettingOutlined, 
  QuestionCircleOutlined, UserOutlined, 
  LogoutOutlined, PieChartOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  // --- XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // --- MENU PROFILE (Góc phải trên) ---
  const userMenu = {
    items: [
      { 
        key: 'profile', 
        label: 'Hồ sơ cá nhân', 
        icon: <UserOutlined />, 
        onClick: () => navigate('/profile') 
      },
      { type: 'divider' },
      { 
        key: 'logout', 
        label: 'Đăng xuất', 
        icon: <LogoutOutlined />, 
        danger: true, 
        onClick: handleLogout 
      },
    ]
  };

  // --- MENU SIDEBAR (Bên trái) ---
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/classes',
      icon: <ReadOutlined />,
      label: 'Lớp đồ án',
    },
    // PHÂN QUYỀN: GV xem Tiến độ lớp, SV xem Nhóm của tôi
    isLecturer ? {
      key: '/projects', // Dẫn đến trang danh sách tất cả các nhóm (để xem tiến độ)
      icon: <PieChartOutlined />,
      label: 'Chi tiết tiến độ',
    } : {
      key: '/projects', // Với SV, trang này sẽ hiển thị "Nhóm của tôi" (đã filter ở frontend)
      icon: <ProjectOutlined />,
      label: 'Nhóm đồ án của tôi',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: 'Lịch biểu',
    },
    {
      key: '/inbox',
      icon: <MessageOutlined />,
      label: <Space>Tin nhắn <Badge count={0} size="small" /></Space>, // Placeholder badge
    },
    { type: 'divider' }, // Đường kẻ phân cách
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      key: '/support',
      icon: <QuestionCircleOutlined />,
      label: 'Hỗ trợ',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <Sider trigger={null} collapsible collapsed={collapsed} width={240} style={{
        overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100
      }}>
        <div
          style={{
            height: 70,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 10,
            textAlign: 'center',
            padding: '8px 12px',
          }}
          >
          {collapsed ? (
            <ProjectOutlined style={{ fontSize: 24, color: '#fff' }} />
          ) : (
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                Quản lý & Theo dõi
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                 Đồ Án
              </div>
            </div>
          )}
        </div>

        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]} // Highlight menu theo URL hiện tại
          items={menuItems}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      
      {/* MAIN CONTENT AREA */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 99,
            boxShadow: '0 2px 8px #f0f1f2'
          }}
        >

          
          {/* Nút Toggle Sidebar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />

          {/* User Info & Avatar */}
          <Dropdown menu={{ items: userMenu.items }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  lineHeight: 1.2
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {userInfo?.fullName || 'Người dùng'}
                </span>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {isLecturer ? 'Giảng viên' : 'Sinh viên'}
                </span>
              </div>

              <Avatar
                size={40}
                src={userInfo?.avatarUrl}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
            </div>
          </Dropdown>

        </Header>
        
        {/* Nơi chứa nội dung thay đổi (Dashboard, Class, Project...) */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'initial'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;