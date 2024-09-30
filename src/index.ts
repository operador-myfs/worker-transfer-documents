import * as dotenv from 'dotenv';
dotenv.config();
import amqplib from 'amqplib';
import { ITransferMessage } from './types/message.types';
import { uploadFileToS3 } from './helpers/uploadFileToS3';
import { saveDocToDB } from './helpers/saveDocToDB';
import { updateTransferTransaction } from './helpers/updateTransferTransaction';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';

(async (): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    const queue = 'transfer_citizen';

    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async rawMessage => {
      const message = JSON.parse(rawMessage.content.toString()) as ITransferMessage;
      const key = `${Date.now()}-${message.key.trim().replaceAll(' ', '+')}`;

      const { success: success1 } = await uploadFileToS3(message.id.toString(), message.url, key);
      const { success: success2 } = await saveDocToDB(message.id.toString(), message.key, key);

      if (success1 == false || success2 == false) {
        await updateTransferTransaction('error', message.transactionId, message.key);
      }

      const { success: success3 } = await updateTransferTransaction('success', message.transactionId, message.key);
      if (success3 === true) channel.ack(rawMessage);

      //TODO validar transferencia exitosa
    });
  } catch (error) {
    console.log(error);
  }
})();
