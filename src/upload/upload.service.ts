import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as AWS from 'aws-sdk';

import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { ID } from 'src/app/controllers/services/base.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { Upload, UploadDocument } from './entities/upload.entity';
import videoOrImage from 'src/helper/videoOrImage';

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
    const s3 = new AWS.S3({
      s3BucketEndpoint: true,
      endpoint: 'https://sin1.contabostorage.com/survey-qc-clone',
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
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: key,
        Metadata: {
          'Content-Type': ContentType,
        },
        ContentType: ContentType,
      })
      .promise();
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
    const urlPublic = `https://sin1.contabostorage.com/65edcc7acb8d42228fd4549693592d9f:survey-qc-clone/${uploadResult.Key}${refreshURL}`;
    const newFile = await this.uploadModel.create({
      key: uploadResult.Key,
      name: uploadResult.Key,
      url: uploadResult.Location,
      urlPublic,
      ...data,
    });
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
