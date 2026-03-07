import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Table, Typography, Avatar, Tag, Tooltip, message, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const ClassGradesPage = () => {
  const { classData } = useOutletContext();
  const [data, setData] = useState({ assignments: [], students: [] }); // Dữ liệu từ API
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  useEffect(() => {
    const fetchGradebook = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/coursework/grades/class/${classData._id}`);
        setData(response.data);
      } catch (error) {
        message.error('Lỗi tải sổ điểm');
      } finally {
        setLoading(false);
      }
    };

    if (classData?._id) fetchGradebook();
  }, [classData]);

  // --- GIAO DIỆN GIẢNG VIÊN (BẢNG TỔNG HỢP) ---
  const renderLecturerView = () => {
    // 1. Cột cố định: Thông tin SV
    const columns = [
        {
            title: 'Sinh viên',
            dataIndex: 'fullName',
            key: 'student',
            fixed: 'left',
            width: 200,
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={record.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{record.studentId}</div>
                    </div>
                </div>
            )
        },
        // 2. Cột động: Mỗi bài tập là 1 cột
        ...data.assignments.map(assign => ({
            title: <Tooltip title={assign.title}>{assign.title.substring(0, 15) + (assign.title.length>15?'...':'')}</Tooltip>,
            dataIndex: ['grades', assign._id],
            key: assign._id,
            align: 'center',
            width: 120,
            render: (gradeInfo) => {
                if (!gradeInfo?.submitted) return <Text type="secondary">-</Text>;
                if (gradeInfo.score === undefined) return <Tag color="orange">Đã nộp</Tag>; // Chưa chấm
                
                let color = gradeInfo.score >= 8 ? '#3f8600' : gradeInfo.score >= 5 ? '#faad14' : '#cf1322';
                return (
                    <Tooltip title={gradeInfo.feedback || "Chưa có nhận xét"}>
                        <span style={{ fontWeight: 'bold', color }}>{gradeInfo.score}</span>
                    </Tooltip>
                );
            }
        })),
        // 3. Cột tổng kết: Điểm trung bình
        {
            title: 'Trung bình',
            dataIndex: 'averageScore',
            key: 'avg',
            fixed: 'right',
            width: 100,
            align: 'center',
            render: (score) => score ? <Tag color="blue">{score}</Tag> : '-'
        }
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={data.students} 
            rowKey="_id"
            loading={loading}
            scroll={{ x: 1000 }} // Cho phép cuộn ngang nếu nhiều bài tập
            bordered
            pagination={false}
        />
    );
  };

  // --- GIAO DIỆN SINH VIÊN (BẢNG CÁ NHÂN) ---
  const renderStudentView = () => {
      // Tìm dữ liệu của chính mình
      const myData = data.students.find(s => s._id === userInfo._id);
      
      if (!myData) return <div style={{textAlign: 'center', marginTop: 20}}>Đang cập nhật dữ liệu...</div>;

      // Thống kê nhanh
      const assignmentsCount = data.assignments.length;
      const submittedCount = data.assignments.filter(a => myData.grades[a._id]?.submitted).length;
      
      const studentColumns = [
          {
              title: 'Bài tập / Nhiệm vụ',
              dataIndex: 'title',
              key: 'title',
          },
          {
              title: 'Trạng thái',
              key: 'status',
              render: (_, assign) => {
                  const info = myData.grades[assign._id];
                  if (!info?.submitted) return <Tag icon={<CloseCircleOutlined />} color="default">Chưa nộp</Tag>;
                  if (info.score === undefined) return <Tag icon={<CheckCircleOutlined />} color="processing">Đang chấm</Tag>;
                  return <Tag icon={<CheckCircleOutlined />} color="success">Đã chấm</Tag>;
              }
          },
          {
              title: 'Điểm số',
              key: 'score',
              align: 'center',
              render: (_, assign) => {
                  const info = myData.grades[assign._id];
                  return info?.score !== undefined ? <Text strong style={{fontSize: 16, color: '#1890ff'}}>{info.score}</Text> : '-';
              }
          },
          {
              title: 'Nhận xét của GV',
              key: 'feedback',
              render: (_, assign) => {
                  const info = myData.grades[assign._id];
                  return info?.feedback ? <Text type="secondary" italic>"{info.feedback}"</Text> : '';
              }
          }
      ];

      return (
          <div>
              {/* Thẻ thống kê cá nhân */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={8}>
                      <Card>
                          <Statistic title="Bài tập đã nộp" value={submittedCount} suffix={`/ ${assignmentsCount}`} />
                      </Card>
                  </Col>
                  <Col span={8}>
                      <Card>
                          <Statistic 
                            title="Điểm trung bình" 
                            value={myData.averageScore || '...'} 
                            prefix={<TrophyOutlined />} 
                            valueStyle={{ color: '#cf1322' }} 
                          />
                      </Card>
                  </Col>
              </Row>

              <Card title="Chi tiết bảng điểm">
                  <Table 
                      columns={studentColumns}
                      dataSource={data.assignments} // Duyệt qua list assignments để render dòng
                      rowKey="_id"
                      pagination={false}
                  />
              </Card>
          </div>
      );
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Sổ điểm & Đánh giá</Title>
        <Text type="secondary">Tổng hợp kết quả học tập</Text>
      </div>

      {isLecturer ? renderLecturerView() : renderStudentView()}
    </div>
  );
};

export default ClassGradesPage;