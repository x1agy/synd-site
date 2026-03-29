import { useState, type FC, type ReactNode } from 'react';
import { UserContext } from './UserContext';
import type { UserDataType } from '../types/user';
import { isUserDataValid } from '../utils/user';

const savedUser = JSON.parse(
  sessionStorage.getItem('user_data') ?? '{}'
) as UserDataType;

const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<UserDataType | undefined>(
    isUserDataValid(savedUser) ? savedUser : undefined
  );

  return (
    <UserContext.Provider value={{ data, setData }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
