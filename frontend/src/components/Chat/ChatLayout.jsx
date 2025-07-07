import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../redux/slices/userSlice';
import { fetchMe } from '../../redux/slices/authSlice';
import { socketService } from '../../socket/socket';
import AppHeader from '../common/AppHeader';
import UserSidebar from './UserSidebar';
import ChatWindow from './ChatWindow';
import MessagePopup from './MessagePopup';
import {
  addMessage,
  setOnlineUsers,
  setTypingUsers,
  updateMessageStatus,
} from '../../redux/slices/chatSlice';
import { updateUserOnlineStatus, updateUserLastMessage } from '../../redux/slices/userSlice';

const { Sider, Content } = Layout;

const ChatLayout = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  const [popupMessage, setPopupMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchUsers());
    
    if (token) {
      const socket = socketService.connect(token);

      socket.on('new-message', (message) => {
        dispatch(addMessage(message));

        const otherUserId = message.sender === user?._id ? message.receiver : message.sender;
        dispatch(updateUserLastMessage({
          userId: otherUserId,
          message: message.text || message.message, // adapt if backend uses 'text'
          timestamp: message.createdAt || message.timestamp, // adapt if backend uses 'createdAt'
        }));

        if (!activeChat || (activeChat !== message.sender && message.sender !== user?._id)) {
          const senderName = message.senderName || 'Unknown';
          const displayMessage = (message.text || message.message)?.length > 20
            ? (message.text || message.message).substring(0, 20) + '...'
            : (message.text || message.message);

          setPopupMessage({
            sender: message.sender,
            message: displayMessage,
            senderName,
          });

          setTimeout(() => setPopupMessage(null), 4000);
        }
      });

      socket.on('message-status-update', ({ messageId, status }) => {
        dispatch(updateMessageStatus({ messageId, status }));
      });

      socket.on('online-users', (users) => {
        dispatch(setOnlineUsers(users));
        users.forEach((userId) => {
          dispatch(updateUserOnlineStatus({ userId, isOnline: true }));
        });
      });

      socket.on('user-online', ({ userId }) => {
        dispatch(updateUserOnlineStatus({ userId, isOnline: true }));
      });

      socket.on('user-offline', ({ userId, lastSeen }) => {
        dispatch(updateUserOnlineStatus({ userId, isOnline: false, lastSeen }));
      });

      socket.on('typing', ({ userId }) => {
        dispatch(setTypingUsers([userId]));
      });

      socket.on('stop-typing', () => {
        dispatch(setTypingUsers([]));
      });

      socket.emit('user-online');

      return () => {
        socket.emit('user-offline');
        socketService.disconnect();
      };
    }
  }, [dispatch, token, user?._id, activeChat]);

  const handlePopupClick = (senderId) => {
    setPopupMessage(null);
    const chatRoomId = [user?._id, senderId].sort().join('_');
    dispatch({ type: 'chat/setActiveChat', payload: { userId: senderId, chatRoomId } });
  };

  return (
    <Layout className="h-screen">
      <AppHeader />
      <Layout>
        <Sider width={350} className="bg-white border-r border-gray-200" theme="light">
          <UserSidebar />
        </Sider>
        <Layout>
          <Content className="bg-gray-50">
            <ChatWindow />
          </Content>
        </Layout>
      </Layout>

      {popupMessage && (
        <MessagePopup
          senderName={popupMessage.senderName}
          message={popupMessage.message}
          onClick={() => handlePopupClick(popupMessage.sender)}
          onClose={() => setPopupMessage(null)}
        />
      )}
    </Layout>
  );
};

export default ChatLayout;
