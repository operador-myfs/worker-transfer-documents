import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config';
import { AWS_BUCKET } from '../utils/constants';
import axios from 'axios';

export const uploadFileToS3 = async (uid: number, url: string, key: string): Promise<{ success: boolean }> => {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer',
    });

    const bucketName = AWS_BUCKET;
    const params = {
      Bucket: bucketName,
      Key: `${uid}/${key}`,
      Body: response.data,
      ContentType: response.headers['content-type'],
    };

    await s3.send(new PutObjectCommand(params));

    return {
      success: true,
    };
  } catch (error) {
    console.log('Error when uploading to s3', error);
    return {
      success: false,
    };
  }
};
