import React, { useState, useEffect, useRef } from 'react';
import { Layout, theme, List, Avatar, Input, Button, Typography, Card, Badge, Spin, Empty } from 'antd';
import { SendOutlined, ReadOutlined, ProjectOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  
  const { useToken } = theme;
  const { token } = useToken();

  const messagesEndRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // 1. Tải danh sách phòng chat
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get('/chat/conversations');
        setConversations(data);
        // Mặc định chọn phòng đầu tiên nếu có
        if (data.length > 0) handleSelectChat(data[0]);
      } catch (error) {
        console.error("Lỗi tải danh sách chat");
      } finally {
        setLoadingList(false);
      }
    };
    fetchConversations();
  }, []);

  // 2. Tải tin nhắn khi chọn phòng
  const handleSelectChat = async (chat) => {
      setSelectedChat(chat);
      setLoadingMsg(true);
      socket.emit('join_room', chat.id);
      try {
          const { data } = await api.get(`/chat/messages/${chat.id}`);
          setMessages(data);
          scrollToBottom();
      } catch (error) {
          console.error("Lỗi tải tin nhắn");
      } finally {
          setLoadingMsg(false);
      }
  };

  useEffect(() => {
    const receiveMessageListener = (data) => {
      if (selectedChat && data.conversationId === selectedChat.id) {
         setMessages((prevMessages) => [...prevMessages, data]);
         scrollToBottom();
      }
    };

    socket.on('receive_message', receiveMessageListener);
    return () => {
      socket.off('receive_message', receiveMessageListener);
    };
  }, [selectedChat]); 

  // 3. Gửi tin nhắn
  const handleSend = async () => {
      if (!inputMessage.trim() || !selectedChat) return;
      
      try {
          const { data } = await api.post('/chat/send', {
              conversationId: selectedChat.id,
              content: inputMessage,
              type: selectedChat.type
          });
          socket.emit('send_message', data);

          setMessages((list) => [...messages, data]);
          setInputMessage('');
          scrollToBottom();
      } catch (error) {
          console.error("Gửi lỗi");
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
  };

  // Render từng tin nhắn
  const renderMessage = (msg) => {
      const isMe = msg.sender._id === userInfo._id;
      return (
          <div key={msg._id} style={{ 
              display: 'flex', 
              justifyContent: isMe ? 'flex-end' : 'flex-start', 
              marginBottom: 16 
          }}>
              {!isMe && (
                  <Avatar size="small" src={msg.sender.avatarUrl} icon={<UserOutlined />} style={{ marginRight: 8, marginTop: 4 }} />
              )}
              <div style={{ maxWidth: '70%' }}>
                  {!isMe && <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{msg.sender.fullName}</div>}
                  <div style={{
                      padding: '10px 16px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? '#1890ff' : '#f0f2f5',
                      color: isMe ? '#fff' : '#000',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                      {msg.content}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                      {dayjs(msg.createdAt).format('HH:mm')}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', background: token.colorBgContainer, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
      
      {/* SIDEBAR DANH SÁCH CHAT */}
      <div style={{ width: 300, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', background: token.colorBgContainer, }}>
              <Title level={5} style={{ margin: 0 }}>Hộp thư đến</Title>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingList ? <div style={{textAlign: 'center', padding: 20}}><Spin /></div> : (
                  <List
                    itemLayout="horizontal"
                    dataSource={conversations}
                    renderItem={item => (
                        <div 
                            onClick={() => handleSelectChat(item)}
                            style={{ 
                                padding: '12px 16px', 
                                cursor: 'pointer', 
                                background: token.colorBgContainer,
                                borderRight: selectedChat?.id === item.id ? '3px solid #1890ff' : 'none',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { if(selectedChat?.id !== item.id) background: token.colorBgContainer; }}
                            onMouseLeave={(e) => { if(selectedChat?.id !== item.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                    style={{ backgroundColor: item.type === 'class' ? '#faad14' : '#52c41a', marginRight: 12 }} 
                                    icon={item.type === 'class' ? <ReadOutlined /> : <ProjectOutlined />} 
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <Text strong style={{ display: 'block' }} ellipsis>{item.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Nhấn để xem tin nhắn</Text>
                                </div>
                            </div>
                        </div>
                    )}
                  />
              )}
          </div>
      </div>

      {/* KHUNG CHAT CHÍNH */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: token.colorBgContainer, }}>
          {selectedChat ? (
              <>
                  {/* HEADER */}
                  <div style={{ padding: '12px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>{selectedChat.name}</Title>
                  </div>

                  {/* MESSAGE LIST */}
                  <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: token.colorBgContainer, }}>
                      {loadingMsg ? <div style={{textAlign: 'center'}}><Spin /></div> : (
                          messages.length > 0 ? messages.map(renderMessage) : <Empty description="Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!" />
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  {/* INPUT AREA */}
                  <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: token.colorBgContainer, }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                          <Input 
                              placeholder="Nhập tin nhắn..." 
                              value={inputMessage}
                              onChange={e => setInputMessage(e.target.value)}
                              onPressEnter={handleSend}
                              style={{ borderRadius: 20 }}
                          />
                          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} />
                      </div>
                  </div>
              </>
          ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: '#ccc' }}>
                  <MessageOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <Text type="secondary">Chọn một cuộc hội thoại để bắt đầu</Text>
              </div>
          )}
      </div>
    </div>
  );
};

export default InboxPage;