import { updateEnvironmentVariables } from './secrets';

// // Ejecuta la actualización de variables de entorno
// updateEnvironmentVariables().catch(console.error);

//COLLECTIONS NAMES
export const DOCUMENTS_COLLECTION = 'documents';
export const TRANSFER_COLLECTION = 'transfer';

//AWS
export const AWS_BUCKET = 'myfs-aws-bucket';
export const AWS_REGION = 'us-east-1';
export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

//FIREBASE
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
