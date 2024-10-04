import amqplib from 'amqplib';
import { updateTransferTransaction } from '../helpers/updateTransferTransaction';
import { uploadFileToS3 } from '../helpers/uploadFileToS3';
import { ITransferMessage } from '../types/message.types';
import { saveDocToDB } from '../helpers/saveDocToDB';
import { getTransactionDoc } from '../helpers/getTransactionDoc';
import { confirmTransfer } from '../helpers/confirmTransfer';

export const transferProcessor = async (message: ITransferMessage): Promise<{ success: Boolean }> => {
  console.log('Document transfered!', message);
  return { success: true };

  // TODO: Remove comments
  // const key = `${Date.now()}-${message.key.trim().replaceAll(' ', '+')}`;

  // const { success: uploadSuccess } = await uploadFileToS3(message.id, message.url, key);
  // const { success: saveDocSuccess } = await saveDocToDB(message.id, message.key, key);

  // if (uploadSuccess == false || saveDocSuccess == false) {
  //   await updateTransferTransaction('error', message.transactionId, message.key);
  //   return { success: false };
  // }

  // const { success: updateDocSuccess } = await updateTransferTransaction('success', message.transactionId, message.key);
  // const { success: getDocSuccess, doc } = await getTransactionDoc(message.transactionId);

  // const isTransferCompleted = Object.entries(doc.documents).every(([_key, value]) => value.state === 'success');
  // if (isTransferCompleted) await confirmTransfer(message.id, doc.confirmationURL);

  // return { success: updateDocSuccess === true && getDocSuccess === true };
};
