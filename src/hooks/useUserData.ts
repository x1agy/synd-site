import { useEffect, useRef } from 'react';
import { CLIENT_ID, SYND_ID } from '../constants/env';
import type { UserDataType } from '../types/user';
import { isUserDataValid } from '../utils/user';
import { useUser } from '../context/UserContext';

/**
 * ### Хук возвращает всегда валидную userData
 *
 * @returns [userData, fetchUserData]
 */
const useUserData = () => {
  const { data, setData } = useUser();
  const isFetching = useRef(false);

  const handleAuth = () => {
    if (isFetching.current) return;
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: document.URL,
      response_type: 'token',
      scope: ['identify', 'email', 'guilds', 'guilds.members.read'].join(' '),
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  const fetchUserData = async (
    token: string
  ): Promise<UserDataType | undefined> => {
    try {
      const [userRes, guildMemberRes, guildsRes] = await Promise.all([
        fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://discord.com/api/users/@me/guilds/${SYND_ID}/member`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://discord.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userRes.ok) throw new Error('Failed to fetch user');

      const userData = await userRes.json();
      const guilds = await guildsRes.json();

      let memberData = null;
      if (guildMemberRes.ok) {
        memberData = await guildMemberRes.json();
      }

      return {
        username: userData.username,
        email: userData.email,
        id: userData.id,
        avatar: memberData?.avatar
          ? `https://cdn.discordapp.com/guilds/${SYND_ID}/users/${userData.id}/avatars/${memberData.avatar}.png`
          : `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
        nickname: memberData?.nick || userData.username,
        isOnServer: !!memberData,
        roles: (memberData.roles ?? []) as string[],
        guilds,
      };
    } catch (err) {
      console.error('Ошибка при получении данных:', err);
      return undefined;
    }
  };

  useEffect(() => {
    const hash = window.location.hash;

    const init = async () => {
      if (isUserDataValid(data) || isFetching.current) return;

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) return;

        isFetching.current = true;

        localStorage.setItem(
          'user_auth',
          JSON.stringify({
            accessToken,
            expiresIn,
            current: new Date().getTime(),
          })
        );

        const userData = await fetchUserData(accessToken);

        if (userData) {
          setData(userData);
          sessionStorage.setItem('user_data', JSON.stringify(userData));
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        isFetching.current = false;
      }
    };

    init();
  }, [data, setData]);

  return [data, handleAuth] as const;
};

export default useUserData;
