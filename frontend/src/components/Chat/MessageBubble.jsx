import React from 'react';
import { Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils/formatTime';

const { Text } = Typography;

const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return (
          <CheckOutlined className="text-gray-400 text-xs opacity-70" />
        );
      case 'delivered':
        return (
          <div className="flex">
            <CheckOutlined className="text-gray-400 text-xs -mr-1 opacity-70" />
            <CheckOutlined className="text-gray-400 text-xs opacity-70" />
          </div>
        );
      case 'read':  // Changed from 'seen' to 'read' to match backend
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
    const messageDate = new Date(message.timestamp);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return formatTime(message.timestamp);
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return formatTime(message.timestamp);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
          isOwn
            ? 'bg-green-500 text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
        }`}
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <Text
          className={`block ${
            isOwn ? 'text-white' : 'text-gray-800'
          }`}
        >
          {message.text} {/* updated from message.message */}
        </Text>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <Text
            className={`text-xs ${
              isOwn ? 'text-white opacity-80' : 'text-gray-500'
            }`}
          >
            {getMessageTime()}
          </Text>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
