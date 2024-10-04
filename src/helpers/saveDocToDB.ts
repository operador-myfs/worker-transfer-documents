import { DOCUMENTS_COLLECTION } from '../utils/constants';
import { db } from '../config';
import { IDocument } from '../types/document.types';

export const saveDocToDB = async (uid: number, fileName: string, key: string): Promise<{ success: boolean }> => {
  try {
    const docRef = db.collection(DOCUMENTS_COLLECTION).doc();
    const newDoc: IDocument = {
      id: docRef.id,
      createdAt: Date.now(),
      isAuthenticated: false,
      uid: uid.toString(),
      fileName,
      key,
    };

    await docRef.set(newDoc);

    return {
      success: true,
    };
  } catch (error) {
    console.log('Error when creating db document', error);
    return {
      success: false,
    };
  }
};
