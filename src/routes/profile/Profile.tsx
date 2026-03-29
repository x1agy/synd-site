import { Flex, Image, Tag, Typography } from 'antd';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router';

import styles from './index.module.scss';
import { useEffect } from 'react';
import { departmentColors, departments, roles } from '../../constants/discord';

const Profile = () => {
  const { data: userData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || !userData.isOnServer) {
      alert('Пошёл нахуй пидорас ёбаный');
      navigate('/');
    }
  }, [navigate, userData]);

  if (!userData) return;

  const userDepartments = (userData.roles ?? [])
    .filter((id) => id in departments)
    .map((id) => departments[id as keyof typeof departments]);

  const userRole = (userData.roles ?? [])
    .filter((id) => id in roles)
    .map((id) => roles[id as keyof typeof roles])[0];

  console.log({ userData });
  return (
    <Flex vertical gap={16} className={styles.holder}>
      <Flex gap={16} className={styles.row}>
        <Flex className={styles.block}>
          <Image src={userData.avatar} placeholder />
        </Flex>
        <Flex
          vertical
          className={`${styles.infoBlock} ${styles.block}`}
          gap={6}
        >
          <Typography.Paragraph>{userData.nickname}</Typography.Paragraph>
          <Flex>
            {userRole && (
              <Typography.Paragraph>{userRole}</Typography.Paragraph>
            )}
          </Flex>
          <Flex gap={4} align='center'>
            {userDepartments.length > 0 ? (
              userDepartments.map((name) => (
                <Tag key={name} color={departmentColors[name] ?? 'default'}>
                  {name}
                </Tag>
              ))
            ) : (
              <Typography.Text type='secondary'>Нет отделов</Typography.Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Profile;
