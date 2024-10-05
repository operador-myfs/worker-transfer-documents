import { db } from '../config';
import { ITransferTransaction, TTransferCitizen } from '../types/transfer.types';
import { TRANSFER_COLLECTION } from '../utils/constants';

export const createTransferTransaction = async (
  data: TTransferCitizen
): Promise<{ success: boolean; message: string; doc?: ITransferTransaction }> => {
  try {
    const documents: ITransferTransaction['documents'] = {};

    for (const key in data.Documents) {
      if (Object.prototype.hasOwnProperty.call(data.Documents, key)) {
        const document = data.Documents[key];
        documents[key] = {
          state: 'pending',
          url: document[0],
        };
      }
    }

    const docRef = db.collection(TRANSFER_COLLECTION).doc();
    const newDoc: ITransferTransaction = {
      transactionId: docRef.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      id: data.id,
      citizenEmail: data.citizenEmail,
      citizenName: data.citizenName,
      confirmationURL: data.confirmationURL,
      documents,
    };

    await docRef.set(newDoc);

    return {
      success: true,
      message: 'Document saved successfully',
      doc: newDoc,
    };
  } catch (error) {
    console.error('Error saving transfer transaction:', error);
    return {
      success: false,
      message: 'Error when saving document',
    };
  }
};