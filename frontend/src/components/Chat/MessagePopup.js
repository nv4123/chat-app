import React from 'react';
import { Card, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MessagePopup = ({ senderName, message, onClick, onClose }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <Card
        className="w-80 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onClick}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <Text strong className="block text-gray-800">
              {senderName}
            </Text>
            <Text className="text-sm text-gray-500 truncate">
              {message}
            </Text>
          </div>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          />
        </div>
      </Card>
    </div>
  );
};

export default MessagePopup;
