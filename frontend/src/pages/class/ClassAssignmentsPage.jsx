import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Table, Button, Alert, Modal, Form, Input, DatePicker, message, Tag, Tooltip, Space, Card, Typography, Drawer, List, Avatar, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined, LinkOutlined, ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../api';

const { Title, Text, Paragraph } = Typography;

const ClassAssignmentsPage = () => {
  const { classData } = useOutletContext();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States cho GV
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  // States cho SV
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  const [form] = Form.useForm();
  const [submitForm] = Form.useForm();
  const [gradeForm] = Form.useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  // --- FETCH DATA ---
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/coursework/assignments/class/${classData._id}`);
      setAssignments(data);
    } catch (error) { message.error('Lỗi tải bài tập'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (classData?._id) fetchAssignments(); }, [classData]);

  // --- GV: TẠO BÀI TẬP ---
  const handleCreateAssignment = async (values) => {
    try {
      await api.post('/coursework/assignments', {
        ...values,
        classId: classData._id,
        dueDate: values.dueDate.format('YYYY-MM-DD HH:mm')
      });
      message.success('Đã giao bài tập mới');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchAssignments();
    } catch (error) { message.error('Lỗi tạo bài tập'); }
  };

  // --- GV: XEM DANH SÁCH NỘP & CHẤM ĐIỂM ---
  const openGradeDrawer = async (assignment) => {
      setSelectedAssignment(assignment);
      setIsGradeDrawerOpen(true);
      try {
          const { data } = await api.get(`/coursework/submissions/assignment/${assignment._id}`);
          setSubmissions(data);
      } catch (error) { message.error('Lỗi tải bài nộp'); }
  };

  const handleGrade = async (values) => {
      try {
          await api.put(`/coursework/submissions/${values.submissionId}/grade`, {
              score: values.score,
              feedback: values.feedback
          });
          message.success('Đã chấm điểm');
          // Reload submissions list
          const { data } = await api.get(`/coursework/submissions/assignment/${selectedAssignment._id}`);
          setSubmissions(data);
      } catch (error) { message.error('Lỗi chấm điểm'); }
  };

  // --- SV: NỘP BÀI ---
  const openSubmitModal = async (assignment) => {
      setSelectedAssignment(assignment);
      setIsSubmitModalOpen(true);
      // Kiểm tra xem đã nộp chưa để fill form
      // Lưu ý: API getSubmissions hiện tại dành cho GV lấy list. 
      // Để đơn giản, ta sẽ lấy list submissions về và tìm bài của mình (cách này tạm thời, tối ưu sau)
      try {
          const { data } = await api.get(`/coursework/submissions/assignment/${assignment._id}`);
          const mySub = data.find(s => s.submitter._id === userInfo._id);
          if (mySub) {
              setMySubmission(mySub);
              submitForm.setFieldsValue({ submissionUrl: mySub.submissionUrl, note: mySub.note });
          } else {
              setMySubmission(null);
              submitForm.resetFields();
          }
      } catch (error) {}
  };

  const handleSubmit = async (values) => {
      try {
          await api.post('/coursework/submissions', {
              assignmentId: selectedAssignment._id,
              submissionUrl: values.submissionUrl,
              note: values.note,
              // projectId: Nếu là bài tập nhóm thì gửi thêm ID nhóm (tính sau)
          });
          message.success('Nộp bài thành công!');
          setIsSubmitModalOpen(false);
      } catch (error) { message.error('Nộp bài thất bại'); }
  };

  // --- COLUMNS TABLE ---
  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
          <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 16 }}>{text}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          </Space>
      )
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date) => {
          const isLate = dayjs().isAfter(dayjs(date));
          return <Tag color={isLate ? 'red' : 'green'} icon={<ClockCircleOutlined />}>{dayjs(date).format('DD/MM HH:mm')}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
          isLecturer ? (
              <Button type="primary" size="small" onClick={() => openGradeDrawer(record)}>
                  Xem bài nộp
              </Button>
          ) : (
              <Button type="primary" size="small" icon={<UploadOutlined />} onClick={() => openSubmitModal(record)}>
                  Nộp bài
              </Button>
          )
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Bài tập & Nhiệm vụ</Title>
        {isLecturer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
            Giao bài tập
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={assignments} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* --- MODAL TẠO BÀI TẬP (GV) --- */}
      <Modal title="Giao bài tập mới" open={isCreateModalOpen} onCancel={() => setIsCreateModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleCreateAssignment} layout="vertical">
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Mô tả / Yêu cầu"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="dueDate" label="Hạn nộp" rules={[{ required: true }]}><DatePicker showTime format="YYYY-MM-DD HH:mm" style={{width: '100%'}} /></Form.Item>
            <Form.Item name="attachmentUrl" label="Link tài liệu đính kèm"><Input prefix={<LinkOutlined />} /></Form.Item>
            <Button type="primary" htmlType="submit" block>Giao bài</Button>
        </Form>
      </Modal>

      {/* --- DRAWER CHẤM ĐIỂM (GV) --- */}
      <Drawer
        title={`Bài nộp: ${selectedAssignment?.title}`}
        width={600}
        onClose={() => setIsGradeDrawerOpen(false)}
        open={isGradeDrawerOpen}
      >
          <List
            itemLayout="horizontal"
            dataSource={submissions}
            renderItem={item => (
                <Card style={{ marginBottom: 16 }} size="small">
                    <List.Item.Meta
                        avatar={<Avatar style={{backgroundColor: '#87d068'}} icon={<UserOutlined />} />}
                        title={
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Text strong>{item.submitter?.fullName}</Text>
                                <Text type="secondary" style={{fontSize: 12}}>{dayjs(item.updatedAt).format('DD/MM HH:mm')}</Text>
                            </div>
                        }
                        description={
                            <div style={{ marginTop: 8 }}>
                                <div style={{ marginBottom: 8 }}>
                                    Link bài: <a href={item.submissionUrl} target="_blank" rel="noreferrer"><LinkOutlined /> Mở bài làm</a>
                                </div>
                                {item.note && <div style={{fontStyle: 'italic', color: '#666', marginBottom: 8}}>"{item.note}"</div>}
                                
                                {/* Form chấm điểm mini cho từng SV */}
                                <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 6 }}>
                                    <Form onFinish={handleGrade} layout="inline" initialValues={{ submissionId: item._id, score: item.score, feedback: item.feedback }}>
                                        <Form.Item name="submissionId" hidden><Input /></Form.Item>
                                        <Form.Item name="score" label="Điểm" style={{marginBottom: 8}}>
                                            <InputNumber min={0} max={10} style={{width: 70}} />
                                        </Form.Item>
                                        <Form.Item name="feedback" style={{flex: 1, marginBottom: 8}}>
                                            <Input placeholder="Nhận xét..." />
                                        </Form.Item>
                                        <Button type="primary" size="small" htmlType="submit">Lưu</Button>
                                    </Form>
                                </div>
                            </div>
                        }
                    />
                </Card>
            )}
            locale={{ emptyText: "Chưa có sinh viên nào nộp bài" }}
          />
      </Drawer>

      {/* --- MODAL NỘP BÀI (SV) --- */}
      <Modal title={`Nộp bài: ${selectedAssignment?.title}`} open={isSubmitModalOpen} onCancel={() => setIsSubmitModalOpen(false)} footer={null}>
          <Form form={submitForm} onFinish={handleSubmit} layout="vertical">
              <Form.Item name="submissionUrl" label="Link bài làm (Drive/Github)" rules={[{ required: true }, { type: 'url' }]}>
                  <Input prefix={<LinkOutlined />} placeholder="https://..." />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú thêm">
                  <Input.TextArea rows={2} />
              </Form.Item>
              {mySubmission && (
                  <Alert message={`Bạn đã nộp bài vào ${dayjs(mySubmission.updatedAt).format('DD/MM HH:mm')}. Nộp lại sẽ ghi đè bản cũ.`} type="info" showIcon style={{marginBottom: 16}} />
              )}
              {mySubmission?.score !== undefined && (
                   <Alert message={`Đã chấm điểm: ${mySubmission.score}/10. Nhận xét: ${mySubmission.feedback}`} type="success" showIcon style={{marginBottom: 16}} />
              )}
              <Button type="primary" htmlType="submit" block>Xác nhận nộp</Button>
          </Form>
      </Modal>
    </div>
  );
};

export default ClassAssignmentsPage;