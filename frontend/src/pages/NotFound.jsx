import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Typography, Button, Result } from 'antd';

const { Paragraph } = Typography;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle={
          <Paragraph>
            Oops! The page <strong>{location.pathname}</strong> does not exist.
          </Paragraph>
        }
        extra={
          <Link to="/">
            <Button type="primary">Return to Home</Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFound;
