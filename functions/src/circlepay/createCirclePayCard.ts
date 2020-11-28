import axios from 'axios';

interface ITestIpPayload {
  ip: string;
}

export const testIP = async (): Promise<ITestIpPayload> => {
  const response = await axios.get('https://api.ipify.org?format=json');
  return {
    ip: response.data
  };
};