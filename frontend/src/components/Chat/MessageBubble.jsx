import React from 'react';
import { Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils/formatTime';

const { Text } = Typography;

const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <CheckOutlined className="text-gray-400 text-xs opacity-70" />;
      case 'delivered':
        return (
          <div className="flex">
            <CheckOutlined className="text-gray-400 text-xs -mr-1 opacity-70" />
            <CheckOutlined className="text-gray-400 text-xs opacity-70" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <CheckOutlined className="text-blue-500 text-xs -mr-1" />
            <CheckOutlined className="text-blue-500 text-xs" />
          </div>
        );
      default:
        return null;
    }
  };

  const getMessageTime = () => {
    const timestamp = message?.createdAt;
    if (!timestamp) return '';

    const messageDate = new Date(timestamp);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) return formatTime(timestamp);
    if (isYesterday) return 'Yesterday';

    return formatTime(timestamp);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
          isOwn
            ? 'bg-white text-gray-800 rounded-br-sm' // Sender: white
            : 'bg-green-500 text-white rounded-bl-sm' // Receiver: green
        }`}
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
      >
        <Text className={`block ${isOwn ? 'text-gray-800' : 'text-white'}`}>
          {message.text}
        </Text>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <Text className={`text-xs ${isOwn ? 'text-gray-500' : 'text-white opacity-80'}`}>
            {getMessageTime()}
          </Text>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
