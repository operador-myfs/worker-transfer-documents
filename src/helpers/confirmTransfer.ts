import axios from 'axios';

export const confirmTransfer = async (confirmationUrl: string): Promise<void> => {
  try {
    await axios.post(confirmationUrl);
  } catch (error) {
    console.log('Error at confirm transfer', error);
  }
};
