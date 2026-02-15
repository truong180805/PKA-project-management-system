import React, { useState, useEffect} from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Typography, Space, Badge, notification} from 'antd';
import { 
  MenuFoldOutlined, MenuUnfoldOutlined, 
  DashboardOutlined, ReadOutlined, 
  ProjectOutlined, CalendarOutlined, 
  MessageOutlined, SettingOutlined, 
  QuestionCircleOutlined, UserOutlined, 
  LogoutOutlined, PieChartOutlined,
  BellOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import io from 'socket.io-client';
import api from '../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const socket = io.connect("http://localhost:5000");

dayjs.extend(relativeTime);

const NotificationList = ({ notifications, onRead }) => (
    <div style={{ width: 300, maxHeight: 400, overflowY: 'auto', background: '#fff', boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>Thông báo</div>
        {notifications.length === 0 ? <div style={{padding: 20, textAlign: 'center', color: '#999'}}>Không có thông báo mới</div> : (
            <Menu items={notifications.map(notif => ({
                key: notif._id,
                label: (
                    <div onClick={() => onRead(notif)} style={{ opacity: notif.isRead ? 0.6 : 1 }}>
                        <div style={{ fontWeight: notif.isRead ? 'normal' : 'bold', fontSize: 13 }}>{notif.message}</div>
                        <div style={{ fontSize: 10, color: '#aaa' }}>{dayjs(notif.createdAt).fromNow()}</div>
                    </div>
                ),
                icon: notif.type === 'grade' ? <CheckCircleOutlined style={{color: 'green'}} /> : <BellOutlined />
            }))} />
        )}
    </div>
);

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchNotifs = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (e) { console.error(e); }
    };
    fetchNotifs();

    // SOCKET: Join room riêng của mình để nhận thông báo cá nhân
    if (userInfo._id) {
        socket.emit('join_user_room', userInfo._id);
    }

    // SOCKET: Lắng nghe thông báo mới
    socket.on('receive_notification', (newNotif) => {
        // Play sound (Optional)
        // const audio = new Audio('/notification-sound.mp3'); audio.play();
        
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show Antd notification toast
        notification.open({
            message: 'Thông báo mới',
            description: newNotif.message,
            icon: <BellOutlined style={{ color: '#108ee9' }} />,
            onClick: () => { navigate(newNotif.link); }
        });
    });

    return () => {
        socket.off('receive_notification');
    };
  }, []);

  const handleReadNotif = async (notif) => {
      if (!notif.isRead) {
          try {
              await api.put(`/notifications/${notif._id}/read`);
              setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
          } catch (e) {}
      }
      if (notif.link) navigate(notif.link);
  };

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
      key: '/profile', // <-- ĐƯA PROFILE VÀO ĐÂY (Dưới Dashboard)
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
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

          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            padding: '12px',
        }}>
            <div 
                onClick={handleLogout}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: '10px 16px', 
                    cursor: 'pointer', 
                    color: '#ff4d4f', // Màu đỏ cho nút đăng xuất
                    borderRadius: 8,
                    transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                <LogoutOutlined style={{ fontSize: 18, marginRight: collapsed ? 0 : 10 }} />
                {!collapsed && <span style={{ fontWeight: 500 }}>Đăng xuất</span>}
            </div>
        </div>
      </Sider>
      {/* MAIN CONTENT AREA */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header
            style={{
              padding: '0 24px',
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
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

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}
            >
            
            {/* Bell */}
            <Dropdown 
              dropdownRender={() => 
                <NotificationList 
                  notifications={notifications} 
                  onRead={handleReadNotif} 
                />} 
              trigger={['click']}
              placement="bottomRight"
            >
              <Badge count={unreadCount} overflowCount={9} size="small">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<BellOutlined style={{ fontSize: 20 }} />} 
                />
              </Badge>
            </Dropdown>

            {/* User */}
            
              <div
              onClick={() => navigate('/profile')} 
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
            

          </div>

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