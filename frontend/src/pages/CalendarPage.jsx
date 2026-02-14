import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Typography, Tag, Spin, Card, Row, Col, message } from 'antd';
import { FileTextOutlined, ProjectOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // Để hiện Modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  // Hàm helper để lấy list sự kiện của 1 ngày cụ thể
  const getListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    return events.filter(ev => dayjs(ev.start).format('YYYY-MM-DD') === dateString);
  };

  // Hàm render nội dung trong ô ngày
  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.map((item) => (
          <li key={item.id} onClick={(e) => { e.stopPropagation(); handleSelectEvent(item); }}>
            <Badge 
                status={item.type === 'assignment' ? 'error' : 'processing'} 
                text={
                    <span style={{ fontSize: 12, color: item.type === 'assignment' ? '#cf1322' : '#1890ff' }}>
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

  // Hàm xử lý khi bấm nút "Đi tới chi tiết" trong Modal
  const handleNavigate = () => {
      // Logic điều hướng dựa trên loại event. 
      // Do hiện tại ta chưa lưu ClassID hay ProjectID vào event ở backend một cách đầy đủ cho việc navigate,
      // nên tạm thời ta chỉ đóng modal hoặc navigate chung chung.
      // *Gợi ý nâng cấp:* Backend nên trả về classId và projectId trong object event.
      setIsModalOpen(false);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '0 12px' }}>
      <Title level={2}>Lịch biểu của tôi</Title>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col><Badge status="error" text="Hạn nộp Bài tập" /></Col>
          <Col><Badge status="processing" text="Hạn chót Task nhóm" /></Col>
      </Row>

      <Card>
        <Calendar 
            dateCellRender={dateCellRender} 
            // Antd v5 mới dùng cellRender thay vì dateCellRender, nhưng dateCellRender vẫn support
            // Nếu dùng v5 thuần: cellRender={(current, info) => { if (info.type === 'date') return dateCellRender(current); return info.originNode; }}
        />
      </Card>

      {/* MODAL CHI TIẾT SỰ KIỆN */}
      <Modal 
        title={selectedEvent?.type === 'assignment' ? "Chi tiết Bài tập" : "Chi tiết Công việc"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={[
            <Tag key="status" color={selectedEvent?.type === 'assignment' ? 'red' : 'blue'}>
                {selectedEvent?.type === 'assignment' ? 'DEADLINE' : 'TASK'}
            </Tag>
        ]}
      >
          {selectedEvent && (
              <div>
                  <Title level={5}>{selectedEvent.title}</Title>
                  <div style={{ marginBottom: 12 }}>
                    <ClockCircleOutlined /> Hạn: <strong>{dayjs(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</strong>
                  </div>
                  
                  {selectedEvent.className && (
                      <div style={{ marginBottom: 8 }}><FileTextOutlined /> Lớp: {selectedEvent.className}</div>
                  )}
                  {selectedEvent.projectName && (
                      <div style={{ marginBottom: 8 }}><ProjectOutlined /> Dự án: {selectedEvent.projectName}</div>
                  )}

                  <Card size="small" style={{ background: '#f5f5f5' }}>
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