import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { List, Button, Modal, Form, Input, message, Tooltip, Card, Typography, Empty } from 'antd';
import { PlusOutlined, FilePdfOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import api from '../../api';

const { Title, Text } = Typography;

const ClassMaterialsPage = () => {
  const { classData } = useOutletContext();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isLecturer = userInfo.role === 'lecturer';

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/coursework/materials/class/${classData._id}`);
      setMaterials(data);
    } catch (error) { message.error('Lỗi tải tài liệu'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (classData?._id) fetchMaterials(); }, [classData]);

  const handleUpload = async (values) => {
    try {
      await api.post('/coursework/materials', {
        ...values,
        classId: classData._id
      });
      message.success('Đã đăng tài liệu');
      setIsModalOpen(false);
      form.resetFields();
      fetchMaterials();
    } catch (error) { message.error('Lỗi đăng tài liệu'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Tài liệu Học tập</Title>
        {isLecturer && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm tài liệu
          </Button>
        )}
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={materials}
        loading={loading}
        locale={{ emptyText: <Empty description="Chưa có tài liệu nào" /> }}
        renderItem={(item) => (
          <List.Item>
            <Card
                hoverable
                actions={[
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" key="download">
                        <DownloadOutlined /> Mở tài liệu
                    </a>
                ]}
            >
                <Card.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
                    title={<Tooltip title={item.title}>{item.title}</Tooltip>}
                    description={
                        <div style={{ height: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.description || 'Không có mô tả'}
                        </div>
                    }
                />
            </Card>
          </List.Item>
        )}
      />

      <Modal title="Thêm tài liệu mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleUpload} layout="vertical">
            <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
            <Form.Item name="fileUrl" label="Link file (Drive/Cloud)" rules={[{ required: true }, { type: 'url' }]}><Input prefix={<LinkOutlined />} /></Form.Item>
            <Button type="primary" htmlType="submit" block>Đăng ngay</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassMaterialsPage;