import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Layout from './components/Layout/Layout.tsx';
import Main from './routes/main/Main.tsx';
import { ConfigProvider } from 'antd';

import './style.scss';
import UserProvider from './context/UserProvider.tsx';
import Profile from './routes/profile/Profile.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Main /> },
      { path: '/profile', element: <Profile /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#006aff',
          colorInfo: '#006aff',
          colorBgBase: '#0a0a0e',
          colorTextBase: '#7277b8',
          colorLink: '#7277b8',
          borderRadius: 10,
        },
      }}
    >
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ConfigProvider>
  </StrictMode>
);
