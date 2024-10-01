import { TRANSFER_COLLECTION } from '../utils/constants';
import { db } from '../config';
import { ITransferTransaction } from '../types/transfer.types';

export const getTransactionDoc = async (transactionId: string): Promise<{ success: boolean; doc: ITransferTransaction | null }> => {
  try {
    const snap = await db.collection(TRANSFER_COLLECTION).doc(transactionId).get();
    if (snap.exists) {
      return {
        success: true,
        doc: snap.data() as ITransferTransaction,
      };
    } else {
      return {
        success: false,
        doc: null,
      };
    }
  } catch (error) {
    return {
      success: false,
      doc: null,
    };
  }
};
