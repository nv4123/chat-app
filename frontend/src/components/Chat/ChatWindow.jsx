import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, Typography, Avatar, Badge } from 'antd';
import { SendOutlined, UserOutlined, SmileOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, clearChat } from '../../redux/slices/chatSlice';
import { socketService } from '../../socket/socket';
import MessageBubble from './MessageBubble';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { formatTime } from '../../utils/formatTime';
import { unwrapResult } from '@reduxjs/toolkit';

const { Text, Title } = Typography;

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
const { activeChat, activeChatRoomId, typingUsers } = useSelector((state) => state.chat);
const [messages, setMessages] = useState([]);
  const { users } = useSelector((state) => state.users);

  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const activeUser = users.find(u => u._id === activeChat);
  const chatMessages = messages.filter(m => m.chatRoomId === activeChatRoomId);


  useEffect(() => {
  const fetchAndSetMessages = async () => {
    if (activeChatRoomId && user) {
      const result = await dispatch(fetchMessages(activeChatRoomId)).unwrap();
        setMessages(result); // result is payload
      if (fetchMessages.fulfilled.match(result)) {
        setMessages(result.payload); // Save fetched messages locally
      }
      markMessagesAsSeen();
    }
  };

  fetchAndSetMessages();
}, [activeChatRoomId, user, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
 useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const socket = socketService.connect(token);
    socketService.emit("addUser", user._id); // 🔥 CRUCIAL
  }
}, [user]);
  const markMessagesAsSeen = () => {
    if (!activeChat || !user || !activeChatRoomId) return;

    socketService.emit('messages-seen', { 
      senderId: activeChat, 
      receiverId: user._id, 
      chatRoomId: activeChatRoomId 
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
  if (!messageInput.trim() || !activeChat || !user || !activeChatRoomId) return;

  const result = await dispatch(
    sendMessage({
      chatRoomId: activeChatRoomId,
      sender: user._id,
      receiver: activeChat,
      message: messageInput.trim(),
    })
  ).unwrap(); // 

  if (sendMessage.fulfilled.match(result)) {
    const newMessage = {
      sender: user._id,
      receiver: activeChat,
      text: messageInput.trim(),
      chatRoomId: activeChatRoomId,
      timestamp: new Date().toISOString(), // Optional, to mimic real-time
    };
    socketService.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);


  }

  setMessageInput("");
  handleStopTyping();
};
useEffect(() => {
  const handleIncomingMessage = (data) => {
    console.log("📩 getMessage received", data); // 🧪 Confirm this runs

    if (data.chatRoomId === activeChatRoomId) {
      setMessages((prev) => [...prev, data]);
    }
  };

  socketService.on("getMessage", handleIncomingMessage);

  return () => {
    socketService.off("getMessage", handleIncomingMessage);
  };
}, [activeChatRoomId]);


  const handleCloseChat = () => {
    dispatch(clearChat());
  };

  const handleTyping = () => {
    if (!isTyping && activeChat && activeChatRoomId) {
      setIsTyping(true);
      socketService.emit('typing', { receiverId: activeChat, chatRoomId: activeChatRoomId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (isTyping && activeChat && activeChatRoomId) {
      setIsTyping(false);
      socketService.emit('stop-typing', { receiverId: activeChat, chatRoomId: activeChatRoomId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  const handleEmojiSelect = (emoji) => {
  setMessageInput(prev => prev + emoji.native);
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getLastSeenText = () => {
    if (!activeUser?.lastSeen) return 'Offline';

    const lastSeenDate = new Date(activeUser.lastSeen);
    const now = new Date();
    const diffInHours = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Last seen ${formatTime(activeUser.lastSeen)}`;
    } else if (diffInHours < 48) {
      return 'Last seen yesterday';
    } else {
      return `Last seen ${formatTime(activeUser.lastSeen)}`;
    }
  };

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-64 h-40 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <Title level={2} className="text-gray-800 mb-2">Welcome to ChatApp</Title>
          <Text className="text-gray-500 text-lg block mb-4">
            Select a conversation to start messaging
          </Text>
          <Text className="text-gray-400 text-sm">
            Your messages are end-to-end encrypted. Click on a contact to start chatting.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            dot 
            status={activeUser?.isOnline ? 'success' : 'default'}
            offset={[-2, 32]}
          >
            <Avatar 
              size={40} 
              icon={<UserOutlined />}
              className="bg-gray-400"
            />
          </Badge>
          <div>
            <Title level={5} className="m-0 text-gray-900">{activeUser?.name}</Title>
            <Text className="text-sm text-gray-500">
              {typingUsers.includes(activeChat) 
                ? 'typing...' 
                : activeUser?.isOnline 
                  ? 'online' 
                  : getLastSeenText()
              }
            </Text>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCloseChat}
          className="text-gray-500 hover:text-gray-700"
        />
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-auto bg-gray-50" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      >
        <div className="p-4 space-y-2">
          {chatMessages.map(message => (
            <MessageBubble 
              key={message._id} 
              message={message} 
              isOwn={message.sender === user?._id} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 relative">
          <Button
  type="text"
  icon={<SmileOutlined />}
  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
/>
{showEmojiPicker && (
  <div className="absolute bottom-12 left-0 z-50">
    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
  </div>
)}

          <Input
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="flex-1 border-0 shadow-none bg-transparent p-0"
            style={{ boxShadow: 'none' }}
          />
          <Button
            type="text"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="text-green-600 hover:text-green-700 disabled:text-gray-300 p-1 h-auto min-w-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
