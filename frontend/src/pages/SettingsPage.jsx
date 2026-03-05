import React, { useState, useEffect } from 'react';
import { Typography, Switch, Card, List, Select, message, Spin } from 'antd';
import { BulbOutlined, GlobalOutlined, BellOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext'; // Lấy hook theme
import api from '../api';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Lấy state từ Context
  const [receiveEmail, setReceiveEmail] = useState(true);
  const [language, setLanguage] = useState('vi');
  const [loading, setLoading] = useState(false);

  // Load cài đặt từ Database khi vào trang
  useEffect(() => {
    const fetchSettings = async () => {
      // Lấy từ localStorage cho language
      const savedLang = localStorage.getItem('language') || 'vi';
      setLanguage(savedLang);

      // Lấy từ DB cho Email Setting
      // Lưu ý: Chúng ta cần lấy thông tin user mới nhất
      try {
        // Gọi API lấy profile (nếu bạn chưa có API lấy profile riêng thì dùng localStorage tạm hoặc viết thêm API getProfile)
        // Ở đây giả sử ta dùng localStorage để lấy setting ban đầu, nhưng chuẩn nhất là gọi API
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.settings) {
            setReceiveEmail(userInfo.settings.receiveEmail);
        }
      } catch (error) {
        console.error("Lỗi tải cài đặt");
      }
    };
    fetchSettings();
  }, []);

  // 1. Xử lý đổi Email Notification (Lưu DB)
  const handleEmailChange = async (checked) => {
    setReceiveEmail(checked);
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', {
        settings: {
            receiveEmail: checked
        }
      });
      
      // Cập nhật lại localStorage
      const currentUser = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...currentUser, settings: data.settings }));
      
      message.success(`Đã ${checked ? 'bật' : 'tắt'} thông báo qua Email`);
    } catch (error) {
      message.error('Lỗi lưu cài đặt');
      setReceiveEmail(!checked); // Revert nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý đổi Ngôn ngữ (Lưu LocalStorage - Demo)
  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    message.info('Thay đổi ngôn ngữ sẽ áp dụng sau khi tải lại trang (Demo)');
    // Ở hệ thống thật, bạn sẽ dùng i18n library để đổi text ngay lập tức
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Cài đặt hệ thống</Title>
      
      <Card title="Giao diện" style={{ marginBottom: 24 }}>
        <List>
            <List.Item extra={<Switch checked={isDarkMode} onChange={toggleTheme} />}>
                <List.Item.Meta 
                    avatar={<BulbOutlined style={{ fontSize: 24 }} />} 
                    title="Chế độ tối (Dark Mode)" 
                    description="Chuyển đổi giao diện nền tối giúp bảo vệ mắt" 
                />
            </List.Item>
        </List>
      </Card>

      <Card title="Thông báo">
        <List>
            {/* EMAIL NOTIFICATION SWITCH */}
            <List.Item extra={<Switch checked={receiveEmail} onChange={handleEmailChange} loading={loading} />}>
                <List.Item.Meta 
                    avatar={<BellOutlined style={{ fontSize: 24 }} />} 
                    title="Thông báo qua Email" 
                    description={
                        <span>
                            Nhận email khi có bài tập mới, deadline hoặc tin nhắn. 
                            <br/>
                            <Text type="secondary" style={{fontSize: 12}}>(Cài đặt này được lưu đồng bộ trên tài khoản của bạn)</Text>
                        </span>
                    } 
                />
            </List.Item>
        </List>
      </Card>
    </div>
  );
};

export default SettingsPage;