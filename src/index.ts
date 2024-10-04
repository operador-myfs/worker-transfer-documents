import * as dotenv from 'dotenv';
dotenv.config();
import { Worker } from './worker/worker';
import { transferProcessor } from './processors/transferProcessor';

// Configuración para el worker de transfer_documents
const transferDocumentsWorker = new Worker({
  exchange: "receive_transfer_exchange",
  queue: "transfer.documents",
  routingKey: "transfer.documents",
  processor: transferProcessor,
  dlx: 'receive_transfer_dlx',
  retryQueue: 'transfer.documents_rq',
  dlq: 'transfer.documents_dlq',
  baseDelay: 5000,
  maxRetries: 5,
});

transferDocumentsWorker.start().catch((error) => {
  console.error('Error al iniciar el worker de transfer_documents:', error);
  process.exit(1);
});
