import { SecretsManager } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Usa la configuración por defecto, que utilizará el rol IAM de la instancia
const secretsManager = new SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1', // Usa una región por defecto o configúrala en variables de entorno
});

export async function getSecret(secretName: string): Promise<any> {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if ('SecretString' in data) {
      return JSON.parse(data.SecretString!);
    }
    throw new Error('Secret not found');
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

export async function updateEnvironmentVariables(): Promise<void> {
  try {
    const awsSecrets = await getSecret('operador/prod/documents');

    process.env.AWS_ACCESS_KEY = awsSecrets.AWS_ACCESS_KEY;
    process.env.AWS_SECRET_ACCESS_KEY = awsSecrets.AWS_SECRET_ACCESS_KEY;

    process.env.FIREBASE_PROJECT_ID = awsSecrets.FIREBASE_PROJECT_ID;
    process.env.FIREBASE_CLIENT_EMAIL = awsSecrets.FIREBASE_CLIENT_EMAIL;
    process.env.FIREBASE_PRIVATE_KEY = awsSecrets.FIREBASE_PRIVATE_KEY;

    console.log('Environment variables updated successfully');
  } catch (error) {
    console.error('Error updating environment variables:', error);
    throw error;
  }
}