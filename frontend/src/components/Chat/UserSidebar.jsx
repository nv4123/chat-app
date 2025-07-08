import React, { useMemo, useEffect } from 'react';
import { List, Avatar, Typography, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChat } from '../../redux/slices/chatSlice';
import { formatTime } from '../../utils/formatTime';
import axiosInstance from '../../api/axiosInstance';
import io from 'socket.io-client';

const { Text } = Typography;

const UserSidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { activeChatRoomId, messages } = useSelector((state) => state.chat);

  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });

    socket.emit('addUser', user._id);

    socket.on('messageStatusUpdate', ({ messageId, status }) => {
      console.log(`Message ${messageId} status: ${status}`);
    });

    socket.on('typingStatus', ({ chatRoomId, senderId, isTyping }) => {
      console.log(`${senderId} is ${isTyping ? 'typing' : 'not typing'} in room ${chatRoomId}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id]);

  // const handleUserClick = async (userId) => {
  //   try {
  //     const res = await axiosInstance.post('/chatrooms/create', {
  //       senderId: user._id,
  //       receiverId: userId,
  //     });

  //     const chatRoomId = res.data._id;
  //     dispatch(setActiveChat({ userId, chatRoomId }));
  //   } catch (error) {
  //     console.error('❌ Failed to create/fetch chat room:', error?.response?.data || error.message);
  //   }
  // };
const handleUserClick = async (userId) => {
  try {
    const res = await axiosInstance.post('/chatrooms/create', {
      receiverId: userId,  
    });

    const chatRoomId = res.data._id;
    dispatch(setActiveChat({ userId, chatRoomId }));
  } catch (error) {
    console.error('Failed to create/fetch chat room:', error?.response?.data || error.message);
  }
};

  const sortedUsers = useMemo(() => {
    const filtered = users.filter(u => u._id !== user?._id);

    const getLastMessageTime = (chatRoomId) => {
      const chatMsgs = messages.filter(m => m.chatRoomId === chatRoomId);
      if (!chatMsgs.length) return 0;
      return new Date(chatMsgs[chatMsgs.length - 1].timestamp).getTime();
    };

    return filtered.map(u => {
      const room = messages.find(m => 
        m.chatRoomId && 
        ((m.sender === u._id && m.receiver === user?._id) || 
         (m.sender === user?._id && m.receiver === u._id))
      )?.chatRoomId;
      return { ...u, chatRoomId: room || '' };
    }).sort((a, b) => {
      const timeA = getLastMessageTime(a.chatRoomId);
      const timeB = getLastMessageTime(b.chatRoomId);
      if (timeA !== timeB) return timeB - timeA;
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [users, user?._id, messages]);

  const getLastSeenText = (chatUser) => {
    if (chatUser.isOnline) return 'Online';
    if (!chatUser.lastSeen) return 'Offline';

    const lastSeenDate = new Date(chatUser.lastSeen);
    const now = new Date();
    const diffHrs = (now - lastSeenDate) / (1000 * 60 * 60);

    if (diffHrs < 24) return `Last seen ${formatTime(chatUser.lastSeen)}`;
    if (diffHrs < 48) return 'Last seen yesterday';
    return `Last seen ${formatTime(chatUser.lastSeen)}`;
  };

  const getLastMessage = (chatRoomId) => {
    const msgs = messages.filter(m => m.chatRoomId === chatRoomId);
    if (!msgs.length) return null;
    return msgs.reduce((latest, msg) =>
      new Date(msg.timestamp) > new Date(latest.timestamp) ? msg : latest
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <List
          dataSource={sortedUsers}
          renderItem={(chatUser) => {
            const lastMsg = getLastMessage(chatUser.chatRoomId);
            return (
              <List.Item
                onClick={() => handleUserClick(chatUser._id)}
                className={`cursor-pointer px-4 py-3 hover:bg-gray-50 transition-colors border-0 ${
                  activeChatRoomId === chatUser.chatRoomId ? 'bg-green-50 border-r-4 border-green-500' : ''
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot status={chatUser.isOnline ? 'success' : 'default'} offset={[-2, 32]}>
                      <Avatar size={48} icon={<UserOutlined />} className="bg-gray-400" />
                    </Badge>
                  }
                  title={
                    <div className="flex justify-between items-center">
                      <Text className="font-medium text-gray-900">{chatUser.name}</Text>
                      {lastMsg && (
                        <Text className="text-xs text-gray-500">
                          {formatTime(lastMsg.timestamp)}
                        </Text>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      {lastMsg ? (
                        <Text className="text-sm text-gray-600 truncate block">
                          {lastMsg.sender === user?._id ? 'You: ' : ''}
                          {lastMsg.text}
                        </Text>
                      ) : (
                        <Text className="text-sm text-gray-400">No messages yet</Text>
                      )}
                      <div className="mt-1">
                        <Text className="text-xs text-gray-400">{getLastSeenText(chatUser)}</Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default UserSidebar;