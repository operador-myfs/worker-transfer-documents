// workers/worker.ts
import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { rabbitMQConfig } from '../config';
import { ITransferMessage } from '../types/message.types';

type ProcessorFunction = (message: ITransferMessage) => Promise<any>;

interface WorkerOptions {
  exchange: string;
  queue: string;
  routingKey: string;
  processor: ProcessorFunction;
  dlx?: string;
  retryQueue?: string;
  dlq?: string;
  baseDelay?: number;
  maxRetries?: number;
}

export class Worker {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private options: WorkerOptions;

  constructor(options: WorkerOptions) {
    this.options = options;
  }

  public async start(): Promise<void> {
    try {
      this.connection = await amqplib.connect(rabbitMQConfig.amqpUrl, 'heartbeat=60');
      this.channel = await this.connection.createChannel();

      await this.setupQueues();

      this.channel.prefetch(1);
      console.log(`[*] Esperando mensajes en la cola '${this.options.queue}'. Para salir presiona CTRL+C`);

      await this.channel.consume(
        this.options.queue,
        (msg: ConsumeMessage | null) => {
          if (msg) {
            this.handleMessage(msg).catch((err) => {
              console.error('Unhandled error in message handler:', err);
            });
          }
        },
        { noAck: false },
      );

      // Manejo de cierre de la conexión
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        process.exit(1);
      });

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        process.exit(1);
      });
    } catch (error) {
      console.error('Error al iniciar el worker:', error);
      process.exit(1);
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel is not initialized');

    const {
      exchange,
      queue,
      routingKey,
      dlx,
      retryQueue,
      dlq,
      baseDelay = 5000,
      maxRetries = 10,
    } = this.options;

    // Declarar exchange
    await this.channel.assertExchange(exchange, 'direct', { durable: true });

    // Declarar DLX si está definido
    if (dlx) {
      await this.channel.assertExchange(dlx, 'direct', { durable: true });
    }

    // Declarar cola principal con DLX
    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: dlx || '',
      deadLetterRoutingKey: retryQueue || '',
    });

    // Bind de la cola principal
    await this.channel.bindQueue(queue, exchange, routingKey);

    // Declarar cola de reintentos si está definido
    if (retryQueue) {
      await this.channel.assertQueue(retryQueue, {
        durable: true,
        messageTtl: baseDelay,
        deadLetterExchange: exchange,
        deadLetterRoutingKey: routingKey,
      });

      await this.channel.bindQueue(retryQueue, dlx || exchange, retryQueue);
    }

    // Declarar DLQ si está definido
    if (dlq && dlx) {
      await this.channel.assertQueue(dlq, { durable: true });
      await this.channel.bindQueue(dlq, dlx, dlq);
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel is not initialized');

    try {
      const messageContent: string = msg.content.toString();
      const message: ITransferMessage = JSON.parse(messageContent);

      const result = await this.options.processor(message);

      console.log(`Procesado correctamente: ${JSON.stringify(result)}`);
      this.channel.ack(msg);
    } catch (error) {
      console.error(`Error al procesar el mensaje: ${(error as Error).message}`);

      const headers = msg.properties.headers || {};
      let retries: number = headers['x-retries'] ? parseInt(headers['x-retries'] as string, 10) : 0;
      retries += 1;

      const { retryQueue, dlq, maxRetries } = this.options;

      if (retryQueue && retries <= (maxRetries || 10)) {
        this.channel.publish(
          this.options.dlx || this.options.exchange,
          retryQueue,
          Buffer.from(msg.content),
          {
            headers: { 'x-retries': retries },
            persistent: true,
          },
        );
        console.log(`Reintentando mensaje en '${retryQueue}' (Intento ${retries})`);
      } else if (dlq) {
        this.channel.publish(
          this.options.dlx || this.options.exchange,
          dlq,
          Buffer.from(msg.content),
          {
            persistent: true,
          },
        );
        console.error(`Mensaje enviado a la Dead Letter Queue '${dlq}' después de ${maxRetries} intentos`);
      }

      // Acknowledge el mensaje actual para eliminarlo de la cola
      this.channel.ack(msg);
    }
  }

  public async stop(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
