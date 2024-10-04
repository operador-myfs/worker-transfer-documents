import axios from 'axios';

export const confirmTransfer = async (id: number, confirmationUrl: string): Promise<void> => {
  try {
    await axios.post(confirmationUrl, {
      id,
    });
  } catch (error) {
    console.log('Error at confirm transfer', error);
  }
};
