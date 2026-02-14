import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Typography, Tag, Spin, Card, Row, Col, message, Select, Button, Alert } from 'antd';
import { FileTextOutlined, ProjectOutlined, ClockCircleOutlined, FilterOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State bộ lọc
  const [filterClass, setFilterClass] = useState('all');
  
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/calendar');
        setEvents(data);
      } catch (error) {
        message.error('Không thể tải lịch biểu');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // --- LOGIC LỌC SỰ KIỆN ---
  // Lấy danh sách lớp duy nhất từ events để tạo Dropdown
  const uniqueClasses = [...new Set(events.filter(e => e.type === 'assignment').map(e => JSON.stringify({id: e.classId, name: e.className})))].map(s => JSON.parse(s));

  const filteredEvents = events.filter(ev => {
      if (filterClass === 'all') return true;
      return ev.classId === filterClass;
  });

  const getListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    return filteredEvents.filter(ev => dayjs(ev.start).format('YYYY-MM-DD') === dateString);
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.map((item) => (
          <li key={item.id} onClick={(e) => { e.stopPropagation(); handleSelectEvent(item); }}>
            <Badge 
                color={item.color}
                text={
                    <span style={{ fontSize: 12, color: item.color }}>
                        {item.title}
                    </span>
                } 
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleSelectEvent = (event) => {
      setSelectedEvent(event);
      setIsModalOpen(true);
  };

  // Nút hành động trong Modal
  const handleNavigate = () => {
      if (selectedEvent.type === 'assignment') {
          // Điều hướng đến trang Bài tập của lớp đó
          navigate(`/classes/${selectedEvent.classId}/assignments`);
      } else if (selectedEvent.type === 'task') {
          // Điều hướng về dashboard project (vì task không có project ID rõ ràng trong API calendar này, 
          // ta có thể update API sau nếu cần link chính xác vào task)
          navigate('/projects'); 
      }
      setIsModalOpen(false);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2} style={{margin: 0}}>{isLecturer ? 'Lịch Giảng Dạy & Deadline' : 'Lịch Học Tập & Deadline'}</Title>
            <Text type="secondary">Quản lý thời gian và các mốc quan trọng</Text>
          </div>
          
          {/* BỘ LỌC CHO GIẢNG VIÊN */}
          {isLecturer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FilterOutlined />
                  <Select 
                      defaultValue="all" 
                      style={{ width: 250 }} 
                      onChange={setFilterClass}
                      placeholder="Lọc theo lớp học"
                  >
                      <Option value="all">Hiển thị tất cả các lớp</Option>
                      {uniqueClasses.map(cls => (
                          <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                      ))}
                  </Select>
              </div>
          )}
      </div>
      
      {/* CHÚ THÍCH MÀU SẮC */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col><Badge color="#cf1322" text="Hạn nộp Bài tập (Assignments)" /></Col>
          {!isLecturer && <Col><Badge color="#1890ff" text="Công việc cá nhân (Tasks)" /></Col>}
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      {/* MODAL CHI TIẾT */}
      <Modal 
        title={null}
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
            <Button key="go" type="primary" onClick={handleNavigate}>
                {isLecturer ? 'Đến trang Chấm điểm' : 'Đi đến Nộp bài'} <ArrowRightOutlined />
            </Button>
        ]}
      >
          {selectedEvent && (
              <div>
                  <div style={{ borderLeft: `4px solid ${selectedEvent.color}`, paddingLeft: 12, marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0 }}>{selectedEvent.title}</Title>
                      <Text type="secondary">{dayjs(selectedEvent.start).format('DD tháng MM, YYYY - HH:mm')}</Text>
                  </div>
                  
                  {selectedEvent.className && (
                      <Alert 
                        message={`Lớp: ${selectedEvent.className}`} 
                        type="info" 
                        showIcon 
                        style={{ marginBottom: 16 }} 
                      />
                  )}

                  {selectedEvent.projectName && (
                      <div style={{ marginBottom: 8 }}>
                          <ProjectOutlined /> Dự án: <Text strong>{selectedEvent.projectName}</Text>
                      </div>
                  )}

                  <Card size="small" type="inner" title="Mô tả / Ghi chú">
                      <Paragraph style={{ marginBottom: 0 }}>
                          {selectedEvent.description || "Không có mô tả chi tiết."}
                      </Paragraph>
                  </Card>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default CalendarPage;