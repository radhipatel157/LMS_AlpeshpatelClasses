import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { ALLOWED_SUBMISSION_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@myclass/shared';

export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
}

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'No file provided' });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: 'File exceeds 10 MB limit' });
    }
    if (!ALLOWED_SUBMISSION_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: `File type ${file.mimetype} is not allowed` });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'myclass/uploads'): Promise<UploadResult> {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException({ code: 'INTERNAL_SERVER_ERROR', message: 'File upload failed' }));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            mimeType: file.mimetype,
            fileSize: file.size,
            fileName: file.originalname,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
