import amqplib from 'amqplib';
import { updateTransferTransaction } from '../helpers/updateTransferTransaction';
import { uploadFileToS3 } from '../helpers/uploadFileToS3';
import { ITransferMessage } from '../types/message.types';
import { saveDocToDB } from '../helpers/saveDocToDB';
import { getTransactionDoc } from '../helpers/getTransactionDoc';
import { confirmTransfer } from '../helpers/confirmTransfer';

export const transferDocumentProcessor = async (message: ITransferMessage): Promise<{ success: Boolean }> => {
  console.log('Document transfered!', message);
  return { success: true };
};
