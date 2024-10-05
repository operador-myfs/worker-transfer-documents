import { createTransferTransaction } from '../helpers/createTransferTransaction';
import { rabbitMQConfig } from '../config';
import { TTransferCitizen } from '../types/transfer.types';
import amqplib from 'amqplib';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
const exchange = rabbitMQConfig.transferExchange;

export const transferUserProcessor = async (mes: TTransferCitizen): Promise<{ success: Boolean }> => {
  // Hacer logica de guardar usuario
  publishTransferDocuments(mes);
  console.log('User transfered!', mes);
  return { success: true };
};

export const publishTransferDocuments = async (mes: TTransferCitizen): Promise<void> => {
  const { success, message, doc: docx } = await createTransferTransaction(mes);
  if (!success) {
    throw new Error(message);
  }
  
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    await channel.assertExchange(exchange, 'direct', { durable: true });

    for (const key in mes.Documents) {
      if (Object.prototype.hasOwnProperty.call(mes.Documents, key)) {
        const doc = mes.Documents[key];
        const newMes = {
          transactionId: docx.transactionId,
          id: mes.id,
          url: doc[0],
          key,
        };
        const sent = channel.publish(exchange, rabbitMQConfig.routingKeys.transferDocuments, Buffer.from(JSON.stringify(newMes)),{ persistent: true });
        if (!sent) {
          console.warn(`Message for transaction ${docx.transactionId} could not be sent to exchange ${exchange}`);
        }
      }
    }
  } catch (error) {
    console.log('Error when sending messages', error);
    throw error;
  } finally {
    await channel.close();
    await connection.close();
  };
};
