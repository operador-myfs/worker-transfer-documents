import { createTransferTransaction } from '../helpers/createTransferTransaction';
import { rabbitMQConfig } from '../config';
import { TTransferCitizen } from '../types/transfer.types';
import amqplib from 'amqplib';
import axios from 'axios';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
const exchange = rabbitMQConfig.transferExchange;
const userMicroserviceUrl = process.env.USER_MICROSERVICE_HOST || 'https://your-user-microservice-url.com';

export const transferUserProcessor = async (mes: TTransferCitizen): Promise<{ success: Boolean }> => {
  try {
    const response = await axios.post(`${userMicroserviceUrl}/api/v1/users/create`, {
      name: mes.citizenName,
      username: mes.citizenEmail,
      email: mes.citizenEmail,
    }, {
      headers: {
        'Content-Type': 'application/json', // Si necesitas autenticación, agrega el token aquí
      },
    });

    await publishTransferDocuments(mes);

    console.log('User transferred!', mes);
    return { success: true };
  } catch (error) {
    console.error('Error transferring user:', error);
    throw new Error(`Failed to transfer user: ${error.message}`);
  }
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
