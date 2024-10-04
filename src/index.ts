import * as dotenv from 'dotenv';
dotenv.config();
import amqplib from 'amqplib';
import { transferProcessor } from './processors/transferProcessor';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';

(async (): Promise<void> => {
  const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();

  try {
    const queue = 'transfer_citizen_documents';

    await channel.assertQueue(queue, { durable: true });

    channel.prefetch(1);
    channel.consume(queue, async rawMessage => {
      const { success } = await transferProcessor(rawMessage);
      if (success) channel.ack(rawMessage);
    });
  } catch (error) {
    console.log(error);
  }
})();
