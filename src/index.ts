import * as dotenv from 'dotenv';
dotenv.config();
import amqplib from 'amqplib';
import { transferProcessor } from './processors/transferProcessor';
import { ITransferMessage } from './types/message.types';

const {
  AMQP_URL = 'amqp://localhost:5672',
  EXCHANGE_NAME = 'receive_transfer_exchange',
  DLX_NAME = 'receive_transfer_dead_letter_exchange',
  QUEUE_NAME = 'transfer.documents',
  RETRY_QUEUE_NAME = 'transfer.documents_rq',
  DLQ_NAME = 'transfer.documents_dlq',
  BASE_DELAY = '5000',
  MAX_RETRIES = '10',
} = process.env;

const BASE_DELAY_MS: number = parseInt(BASE_DELAY, 10);
const MAX_RETRIES_COUNT: number = parseInt(MAX_RETRIES, 10);

async function setupQueues(channel: amqplib.Channel): Promise<void> {
  await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });

  await channel.assertExchange(DLX_NAME, 'direct', { durable: true });

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    deadLetterExchange: DLX_NAME,
    deadLetterRoutingKey: RETRY_QUEUE_NAME,
  });

  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, QUEUE_NAME);

  await channel.assertQueue(RETRY_QUEUE_NAME, {
    durable: true,
    messageTtl: BASE_DELAY_MS,
    deadLetterExchange: EXCHANGE_NAME,
    deadLetterRoutingKey: QUEUE_NAME,
  });

  await channel.bindQueue(RETRY_QUEUE_NAME, DLX_NAME, RETRY_QUEUE_NAME);
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);
}

(async (): Promise<void> => {
  const connection = await amqplib.connect(AMQP_URL, 'heartbeat=60');
  const channel = await connection.createChannel();
  try {
    await setupQueues(channel);
    channel.prefetch(1);
    console.log(`[*] Esperando mensajes en la cola '${QUEUE_NAME}'. Para salir presiona CTRL+C`);
    await channel.consume(
      QUEUE_NAME,
      (msg: amqplib.ConsumeMessage | null) => {
        if (msg) {
          handleMessage(channel, msg).catch((err) => {
            console.error('Unhandled error in message handler:', err);
          });
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.log(error);
  }
})();


async function handleMessage(
  channel: amqplib.Channel,
  msg: amqplib.ConsumeMessage,
): Promise<void> {
  if (!msg) {
    console.warn('Received null message');
    return;
  }

  try {
    const messageContent: string = msg.content.toString();
    const message: ITransferMessage = JSON.parse(messageContent);
    const result = await transferProcessor(message);

    console.log(`Procesado correctamente: ${JSON.stringify(result)}`);
    channel.ack(msg);
  } catch (error) {
    console.error(`Error al procesar el mensaje: ${(error as Error).message}`);

    const headers = msg.properties.headers || {};
    let retries: number = headers['x-retries'] ? parseInt(headers['x-retries'] as string, 10) : 0;
    retries += 1;

    if (retries <= MAX_RETRIES_COUNT) {
      channel.publish(
        DLX_NAME, // Exchange de Dead Letter
        RETRY_QUEUE_NAME, // Routing Key para la cola de reintentos
        Buffer.from(msg.content),
        {
          headers: { 'x-retries': retries },
          persistent: true,
        },
      );
      console.log(`Reintentando mensaje en '${RETRY_QUEUE_NAME}' (Intento ${retries})`);
    } else {
      channel.publish(
        DLX_NAME, // Exchange de Dead Letter
        DLQ_NAME, // Routing Key para la DLQ
        Buffer.from(msg.content),
        {
          persistent: true,
        },
      );
      console.error(`Mensaje enviado a la Dead Letter Queue '${DLQ_NAME}' después de ${MAX_RETRIES_COUNT} intentos`);
    }

    // Acknowledge el mensaje actual para eliminarlo de la cola
    channel.ack(msg);
  }
}