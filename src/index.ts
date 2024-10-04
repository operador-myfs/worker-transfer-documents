// index.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { Worker } from './worker/worker';
import { transferDocumentProcessor } from './processors/transferDocumentProcessor';
import { transferUserProcessor } from './processors/transferUserProcessor';

const WORKER_TYPE = process.env.WORKER_TYPE; 

if (!WORKER_TYPE) {
  console.error('No se ha especificado WORKER_TYPE. Por favor, establece WORKER_TYPE a "documents" o "user".');
  process.exit(1);
}

let worker: Worker;

switch (WORKER_TYPE) {
  case 'document':
    worker = new Worker({
      exchange: "receive_transfer_exchange",
      dlx: 'receive_transfer_dlx',
      queue: "transfer.documents",
      routingKey: "transfer.documents",
      retryQueue: 'transfer.documents_rq',
      dlq: 'transfer.documents_dlq',
      processor: transferDocumentProcessor,
      baseDelay: 5000,
      maxRetries: 5,
    });
    break;
  case 'user':
    worker = new Worker({
      exchange: "receive_transfer_exchange",
      dlx: 'receive_transfer_dlx',
      queue: "transfer.user",
      routingKey: "transfer.user",
      retryQueue: 'transfer.user_rq',
      dlq: 'transfer.user_dlq',
      processor: transferUserProcessor,
      baseDelay: 5000,
      maxRetries: 5,
    });
    break;
  default:
    console.error(`WORKER_TYPE desconocido: ${WORKER_TYPE}.`);
    process.exit(1);
}

worker.start().catch((error) => {
  console.error(`Error al iniciar el worker de ${WORKER_TYPE}:`, error);
  process.exit(1);
});
