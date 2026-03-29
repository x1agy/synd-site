import type { UserDataType } from '../types/user';

const isUserDataValid = (userData: UserDataType | undefined): boolean => {
  if (!userData) {
    return false;
  } else {
    return !!(userData.id && userData.email && userData.nickname);
  }
};

export { isUserDataValid };
