import { Layout as AntLayout, Avatar, Button, Flex } from 'antd';
import { type FC } from 'react';
import { Link, Outlet } from 'react-router';
import styles from './index.module.scss';
import useUserData from '../../hooks/useUserData';

const { Header, Footer, Content } = AntLayout;

const Layout: FC = () => {
  const [data, fetchData] = useUserData();

  return (
    <AntLayout className={styles.layout}>
      <Header className={styles.header}>
        <Flex
          align='center'
          justify='space-between'
          className={styles.headerContainer}
        >
          <Link to={'/'} className={styles.logo}>
            SYNDICATE
          </Link>

          {data ? (
            <Button className={styles.avatarButton}>
              <Avatar src={data.avatar} />
            </Button>
          ) : (
            <div
              onClick={fetchData}
              style={{ cursor: 'pointer' }}
              role='button'
            >
              Войти
            </div>
          )}
        </Flex>
      </Header>
      <Content className={styles.layoutContent}>
        <Outlet />
      </Content>
      <Footer>{null}</Footer>
    </AntLayout>
  );
};

export default Layout;
