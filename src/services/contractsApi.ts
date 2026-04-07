const API_BASE = 'http://localhost:3001/api';

export const getLastContracts = async (
  name: string
): Promise<
  Array<{ essenceNumber: number; screenshotLink: string; timestamp: string }>
> => {
  const response = await fetch(`${API_BASE}/contracts/${name}`);
  if (!response.ok) throw new Error('Failed to fetch contracts');
  return response.json();
};

export const addContract = async (
  name: string,
  essenceNumber: number,
  screenshotLink: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE}/contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, essenceNumber, screenshotLink }),
  });
  if (!response.ok) throw new Error('Failed to add contract');
  return response.json();
};
