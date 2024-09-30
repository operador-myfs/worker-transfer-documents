import { TRANSFER_COLLECTION } from '../utils/constants';
import { db } from '../config';

export const updateTransferTransaction = async (
  status: 'success' | 'error',
  transactionId: string,
  key: string
): Promise<{ success: boolean }> => {
  try {
    const docRef = db.collection(TRANSFER_COLLECTION).doc(transactionId);
    await docRef.update({
      [`documents.${key}.state`]: status,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log('Error when updating transfer document', error);
    return {
      success: false,
    };
  }
};
