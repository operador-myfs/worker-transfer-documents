import admin from 'firebase-admin';
import { S3Client } from '@aws-sdk/client-s3';
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
} from './utils/constants';

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});


export const rabbitMQConfig = {
  amqpUrl: process.env.AMQP_URL || 'amqp://localhost:5672',

  transferExchange: process.env.TRANSFER_EXCHANGE || 'receive_transfer_exchange',
  confirmExchange: process.env.CONFIRM_EXCHANGE || 'confirm_transfer_exchange',

  routingKeys: {
    transferDocuments: process.env.TRANSFER_DOCUMENTS_ROUTING_KEY || 'transfer.documents',
    transferUser: process.env.TRANSFER_USER_ROUTING_KEY || 'transfer.user',
    confirmDocuments: process.env.CONFIRM_DOCUMENTS_ROUTING_KEY || 'confirm.documents',
    confirmUser: process.env.CONFIRM_USER_ROUTING_KEY || 'confirm.user',
  },
};

const db = admin.firestore();

export { s3, db };
