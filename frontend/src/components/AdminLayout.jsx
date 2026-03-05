import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Typography, Space } from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined, 
  DashboardOutlined, TeamOutlined, 
  LogoutOutlined, SafetyCertificateOutlined,
  BookOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // MENU DÀNH RIÊNG CHO ADMIN
  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Quản lý Người dùng' },
    { key: '/admin/classes', icon: <BookOutlined />, label: 'Quản lý Lớp học' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} collapsible collapsed={collapsed} width={250} 
        style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 0, 0, 0.2)', borderRadius: 8 }}>
           {collapsed ? <SafetyCertificateOutlined style={{ fontSize: 24, color: '#ff4d4f' }} /> : <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>ADMIN PANEL</Text>}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={(e) => navigate(e.key)} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px' }}>
            <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', padding: '10px 16px', cursor: 'pointer', color: '#ff4d4f', borderRadius: 8, transition: 'all 0.3s' }}>
                <LogoutOutlined style={{ fontSize: 18, marginRight: collapsed ? 0 : 10 }} />
                {!collapsed && <span style={{ fontWeight: 500 }}>Đăng xuất</span>}
            </div>
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        <Header style={{ padding: '0 24px', background: '#001529', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 99 }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined style={{color: 'white'}} /> : <MenuFoldOutlined style={{color: 'white'}} />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '16px', width: 64, height: 64 }} />
          <Space>
             <Avatar src={userInfo.avatarUrl} style={{ backgroundColor: '#ff4d4f' }} icon={<SafetyCertificateOutlined />} />
             <Text strong style={{ color: 'white' }}>{userInfo.fullName}</Text>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;