import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProjectOutlined,
    TeamOutlined,
    HomeOutlined,
    ReadOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [userInfo, setUserInfo] = useState(null);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
        navigate('/login');
        } else {
        setUserInfo(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const userMenuItems = [
        { key: 'profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> , onClick: () => navigate('/profile') },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            handleLogout();
        }
        if (key === 'profile') {
            navigate('/profile');
        }
    };

    const menuItems = [
        {
        key: '/dashboard',
        icon: <HomeOutlined />,
        label: 'Tổng quan',
        onClick: () => navigate('/dashboard'),
        },
        {
        key: '/classes',
        icon: <ReadOutlined />,
        label: 'Lớp đồ án', 
        onClick: () => navigate('/classes'),
        },
        {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: 'Đồ án / Nhóm',
        onClick: () => navigate('/projects'),
        },
        
        {
        key: '/users',
        icon: <TeamOutlined />,
        label: 'Quản lý người dùng', 
        onClick: () => navigate('/users'),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
        {/* 1. SIDEBAR TRÁI */}
        <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: '#001529' }}>
            <div style={{ height: 64, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: collapsed ? 10 : 18, overflow: 'hidden' }}>
            {collapsed ? 'QLDA' : 'QUẢN LÝ ĐỒ ÁN'}
            </div>
            <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            selectedKeys={[location.pathname]}
            items={menuItems}
            />
        </Sider>

        <Layout>
            {/* 2. HEADER TRÊN CÙNG */}
            <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <span style={{ fontWeight: 500 }}>
                Xin chào, {userInfo?.fullName} ({userInfo?.role === 'student' ? 'Sinh viên' : 'Giảng viên'})
                </span>
                <Dropdown
                    menu={{ items: userMenuItems, onClick: handleMenuClick }}
                    placement="bottomRight"
                    trigger={['hover']}
                >
                    <span>
                        <Avatar
                        style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                        icon={<UserOutlined />}
                        />
                    </span>
                </Dropdown>
            </div>
            </Header>

            {/* 3. CONTENT Ở GIỮA */}
            <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG, overflow: 'initial' }}>
            {/* Outlet là nơi các trang con (Dashboard, Class, Project...) sẽ hiển thị */}
            <Outlet />
            </Content>
        </Layout>
        </Layout>
    );
    };

export default MainLayout;