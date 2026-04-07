import { useEffect, useMemo, useState } from 'react';
import { departmentColors, departments, roles } from '../../constants/discord';
import { useSkills } from '../../hooks/useSkills';
import { skills as ALL_SKILLS } from '../../constants/google';
import {
  Button,
  Flex,
  Image,
  InputNumber,
  Modal,
  Tag,
  Typography,
  Input,
} from 'antd';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router';
import { getSkillColor } from '../../utils/color';
import { getLastContracts, addContract } from '../../services/contractsApi';

import styles from './index.module.scss';

type SkillMap = Record<string, number | null>;

const nickReg = /\[([^\]]+)\]/;

const Profile = () => {
  const { data: userData } = useUser();
  const { fetchSkills, saveSkills } = useSkills();
  const navigate = useNavigate();
  const dsNick = useMemo(
    () => userData?.nickname.match(nickReg)?.[0],
    [userData?.nickname]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [skillLevels, setSkillLevels] = useState<SkillMap>({});
  const [saved, setSaved] = useState<SkillMap>({});
  const [loading, setLoading] = useState(false);

  const [contracts, setContracts] = useState<
    Array<{ essenceNumber: number; screenshotLink: string; timestamp: string }>
  >([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEssenceNumber, setNewEssenceNumber] = useState<number | null>(null);
  const [newScreenshotLink, setNewScreenshotLink] = useState('');
  const [adding, setAdding] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!userData || !userData.isOnServer) {
      alert('Пошёл нахуй пидорас ёбаный');
      navigate('/');
    }
  }, [navigate, userData]);

  useEffect(() => {
    if (userData?.nickname) {
      fetchSkills(dsNick ?? 'null').then((raw: string[]) => {
        const map: SkillMap = {};
        raw.forEach((cell, i) => {
          const [name, level] = [ALL_SKILLS[i], cell];
          map[name] = Number(level);
        });
        setSaved(map);
      });
      getLastContracts(dsNick ?? '').then(setContracts);
    }
  }, [dsNick, fetchSkills, userData?.nickname]);

  if (!userData) return null;

  if (!dsNick) {
    alert('Ник по форме приведи иначе нихуя работать не будет');
  }

  const userDepartments = (userData.roles ?? [])
    .filter((id) => id in departments)
    .map((id) => departments[id as keyof typeof departments]);

  const userRole = (userData.roles ?? [])
    .filter((id) => id in roles)
    .map((id) => roles[id as keyof typeof roles])[0];

  const handleOpen = () => {
    setSkillLevels({ ...saved });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!isEditMode) {
      setIsEditMode((prev) => !prev);
      return;
    }
    setLoading(true);
    const row = ALL_SKILLS.map((skill) => {
      const level = skillLevels[skill];
      return `${level ?? 0}`;
    });
    await saveSkills(dsNick ?? '', row);
    setSaved({ ...skillLevels });
    setLoading(false);
    setModalOpen(false);
    setIsEditMode((prev) => !prev);
  };

  const handleAddContract = async () => {
    if (newEssenceNumber === null || !newScreenshotLink.trim() || !dsNick) {
      return;
    }

    try {
      setAdding(true);
      await addContract(dsNick, newEssenceNumber, newScreenshotLink.trim());
      const updatedContracts = await getLastContracts(dsNick);
      setContracts(updatedContracts);
      setAddModalOpen(false);
      setNewEssenceNumber(null);
      setNewScreenshotLink('');
    } catch (error) {
      console.error(error);
      alert('Не удалось добавить контракт. Попробуйте ещё раз.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Flex vertical gap={16} className={styles.holder}>
      <Flex gap={16}>
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

      <Flex vertical gap={16}>
        <Flex justify='space-between' align='center' className={styles.block}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Навыки
          </Typography.Title>
          <Button onClick={handleOpen}>Посмотреть навыки</Button>
        </Flex>
      </Flex>

      <Flex vertical gap={16}>
        <Flex justify='space-between' align='center' className={styles.block}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Последние контракты
          </Typography.Title>
          <Button onClick={() => setAddModalOpen(true)}>
            Добавить контракт
          </Button>
        </Flex>
        <Flex vertical gap={8} className={styles.block}>
          {contracts.length > 0 ? (
            contracts.map((contract, index) => (
              <Flex key={index} justify='space-between' align='center'>
                <Typography.Text>
                  Эссенция: {contract.essenceNumber}
                </Typography.Text>
                <a
                  href={contract.screenshotLink}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Скриншот
                </a>
                <Typography.Text type='secondary'>
                  {contract.timestamp}
                </Typography.Text>
              </Flex>
            ))
          ) : (
            <Typography.Text type='secondary'>Нет контрактов</Typography.Text>
          )}
        </Flex>
      </Flex>

      <Modal
        title='Навыки'
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsEditMode(false);
          setModalOpen(false);
        }}
        okText={isEditMode ? 'Сохранить' : 'Обновить навыки'}
        cancelText='Отмена'
        confirmLoading={loading}
        destroyOnHidden
        style={{ border: '1px solid #0e5d5f', borderRadius: '10px' }}
      >
        <Flex vertical gap={10}>
          {ALL_SKILLS.filter((val) =>
            // В режиме просмотра показываются только навыки skillLevels[val] > 0
            !isEditMode ? Number(skillLevels[val]) > 0 : true
          )
            // Сортировка от большего к меньшему
            .sort((a, b) => Number(skillLevels[b]) - Number(skillLevels[a]))
            .map((skill) => {
              const skillLevel = Number(skillLevels[skill] ?? null);
              return (
                <Flex key={skill} justify='space-between' align='center'>
                  <Typography.Text>{skill}</Typography.Text>
                  <InputNumber
                    min={0}
                    max={skill === 'Ферма' ? 9 : 5}
                    placeholder='уровень'
                    value={skillLevel}
                    disabled={!isEditMode}
                    defaultValue={0}
                    style={{
                      borderColor: getSkillColor(skillLevel),
                      width: 44,
                    }}
                    styles={{
                      input: {
                        textAlign: 'center',
                        color: getSkillColor(skillLevel),
                      },
                    }}
                    onChange={(val) =>
                      setSkillLevels((prev) => ({ ...prev, [skill]: val ?? 0 }))
                    }
                  />
                </Flex>
              );
            })}
        </Flex>
      </Modal>

      <Modal
        title='Добавить контракт'
        open={addModalOpen}
        onOk={handleAddContract}
        onCancel={() => {
          setAddModalOpen(false);
          setNewEssenceNumber(null);
          setNewScreenshotLink('');
        }}
        okText='Добавить'
        cancelText='Отмена'
        confirmLoading={adding}
        destroyOnHidden
        style={{ border: '1px solid #0e5d5f', borderRadius: '10px' }}
      >
        <Flex vertical gap={10}>
          <Flex vertical>
            <Typography.Text>Номер эссенции</Typography.Text>
            <InputNumber
              min={1}
              value={newEssenceNumber}
              onChange={setNewEssenceNumber}
              placeholder='Введите номер эссенции'
            />
          </Flex>
          <Flex vertical>
            <Typography.Text>Ссылка на скриншот</Typography.Text>
            <Input
              value={newScreenshotLink}
              onChange={(e) => setNewScreenshotLink(e.target.value)}
              placeholder='Введите ссылку на скриншот'
            />
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  );
};

export default Profile;
