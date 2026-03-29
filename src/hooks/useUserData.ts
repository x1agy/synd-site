import { useEffect } from 'react';
import { CLIENT_ID, REDIRECT_URI, SYND_ID } from '../constants/env';
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

  const handleAuth = () => {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'token',
      scope: ['identify', 'email', 'guilds', 'guilds.members.read'].join(' '),
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  const fetchUserData = async (
    token: string
  ): Promise<UserDataType | undefined> => {
    try {
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();

      const guildMemberRes = await fetch(
        `https://discord.com/api/users/@me/guilds/${SYND_ID}/member`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const guilds = await (
        await fetch(`https://discord.com/api/users/@me/guilds`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ).json();

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
        guilds,
      };
    } catch (err) {
      console.error('Ошибка при получении данных:', err);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    const func = async () => {
      if (isUserDataValid(data)) return;

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        localStorage.setItem(
          'user_auth',
          JSON.stringify({
            accessToken,
            expiresIn,
            current: new Date().getTime(),
          })
        );

        if (accessToken) {
          const userData = await fetchUserData(accessToken);
          setData(userData);
          sessionStorage.setItem('user_data', JSON.stringify(userData ?? {}));

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    };

    func();
  }, [data, setData]);

  return [data, handleAuth] as const;
};

export default useUserData;
