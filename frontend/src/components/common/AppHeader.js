import React from 'react';
import { Layout, Typography, Button, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, MoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <Title level={3} className="m-0 text-green-600">
        ChatApp
      </Title>

      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
          className="text-gray-600 hover:bg-gray-100"
        />
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
