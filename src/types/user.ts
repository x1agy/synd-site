import type { Dispatch, SetStateAction } from 'react';

type UserDataType = {
  username: string;
  email: string;
  id: string;
  avatar: string;
  nickname: string;
  isOnServer: boolean;
  roles: string[];
  fullData: unknown;
  guilds: {
    id: string;
    name: string;
    icon?: string;
    banner?: string;
    owner: boolean;
    permissions: number;
    permissions_new: string;
    features: string[];
  }[];
};

type UserContextType = {
  data: UserDataType | undefined;
  setData: Dispatch<SetStateAction<UserDataType | undefined>>;
};

export type { UserDataType, UserContextType };
