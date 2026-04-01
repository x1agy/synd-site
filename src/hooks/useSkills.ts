/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { SKILLS_SCRIPT } from '../constants/env';

export const useSkills = () => {
  const fetchSkills = useCallback((username: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const callbackName = `cb_${Date.now()}`;

      (window as any)[callbackName] = (data: { skills: string[] }) => {
        resolve(data.skills ?? []);
        delete (window as any)[callbackName];
        document.getElementById(callbackName)?.remove();
      };

      const script = document.createElement('script');
      script.id = callbackName;
      script.src = `${SKILLS_SCRIPT}?username=${encodeURIComponent(
        username
      )}&callback=${callbackName}`;
      document.body.appendChild(script);
    });
  }, []);

  const saveSkills = async (
    username: string,
    skills: string[]
  ): Promise<void> => {
    await fetch(SKILLS_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ username, skills }),
    });
  };

  return { fetchSkills, saveSkills };
};
