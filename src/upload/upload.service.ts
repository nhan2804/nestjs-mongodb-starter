import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';

import { S3Client } from '@aws-sdk/client-s3';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { ID } from 'src/app/controllers/services/base.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Upload, UploadDocument } from './entities/upload.entity';
import videoOrImage from 'src/helper/videoOrImage';
import { Upload as UploadS3 } from '@aws-sdk/lib-storage';

@Injectable()
export class UploadService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Upload.name) readonly uploadModel: Model<UploadDocument>,
  ) {}
  async uploadPublicFile(
    dataBuffer: Buffer,
    filename: string,
    mimetype: string,
    data?: {
      projectId: ID;
      ownerId: ID;
      rawProjectId: string;
      oldUrl: string;
    },
  ) {
    const s3 = new S3Client({
      endpoint: this.configService.get('ENDPOINT_R2')?.trim(),
    });

    const extArray = mimetype.split('/');
    const extension = extArray[extArray.length - 1];
    const typeFile = videoOrImage('.' + extension);

    const ContentType = typeFile === 'images' ? 'image/jpeg' : 'video/mp4';
    const key =
      data?.oldUrl ||
      `${data?.rawProjectId?.toString() || 'unknown'}/${typeFile}/${nanoid(
        10,
      )}-${filename}`;
    const uploadResult = await new UploadS3({
      client: s3,

      params: {
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME')?.trim(),
        Body: dataBuffer,
        Key: key,
        Metadata: {
          'Content-Type': ContentType,
        },
        ContentType: ContentType,
      },
    }).done();
    // const up2 = await s3.putObject({
    //   Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
    //   Body: dataBuffer,
    //   Key: key,

    //   Metadata: {
    //     'Content-Type': 'image/jpeg',
    //   },
    // });
    // khoong lay duoc url public
    const refreshURL = data?.oldUrl
      ? '?v=' + Math.floor(Math.random() * 9999) + 1
      : '';
    const urlPublic = `${this.configService.get('R2_PUBLIC')}/${
      uploadResult?.Key
    }${refreshURL}`;
    const newFile = {
      key: key,
      name: key,
      url: urlPublic,
      urlPublic,
      ...data,
    };
    return { newFile, uploadResult: { ...uploadResult, urlPublic } };
  }
  create(createUploadDto: CreateUploadDto) {
    return 'This action adds a new upload';
  }

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  async remove(key: string) {
    const s3 = new AWS.S3({
      s3BucketEndpoint: true,
      endpoint: 'https://sin1.contabostorage.com/bsc-qc',
    });
    const done = await s3.deleteObject({
      Key: key,
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
    });
    const delet = await this.uploadModel.findOneAndDelete({ key: key });
    return delet;
  }
}
