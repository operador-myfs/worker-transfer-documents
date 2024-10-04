import * as dotenv from 'dotenv';
dotenv.config();
import { Worker } from './worker/worker';
import { transferDocumentProcessor } from './processors/transferDocumentProcessor';
import { transferUserProcessor } from './processors/transferUserProcessor';

const transferDocumentsWorker = new Worker({
  exchange: "receive_transfer_exchange",
  queue: "transfer.documents",
  routingKey: "transfer.documents",
  processor: transferDocumentProcessor,
  dlx: 'receive_transfer_dlx',
  retryQueue: 'transfer.documents_rq',
  dlq: 'transfer.documents_dlq',
  baseDelay: 5000,
  maxRetries: 5,
});

const transferUserWorker = new Worker({
  exchange: "receive_transfer_exchange",
  queue: "transfer.users",
  routingKey: "transfer.users",
  processor: transferUserProcessor,
  dlx: 'receive_transfer_dlx',
  retryQueue: 'transfer.users_rq',
  dlq: 'transfer.users_dlq',
  baseDelay: 5000,
  maxRetries: 5,
});

transferDocumentsWorker.start().catch((error) => {
  console.error('Error al iniciar el worker de transfer_documents:', error);
  process.exit(1);
});


transferUserWorker.start().catch((error) => {
  console.error('Error al iniciar el worker de transfer_users:', error);
  process.exit(1);
});