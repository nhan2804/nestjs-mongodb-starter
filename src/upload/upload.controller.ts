import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/guards/public';
import { Types } from 'mongoose';
import { UserLoggin } from 'src/auth/decorators/user';
import { UserDocument } from 'src/users/entities/user.entity';
@Controller('upload/s3')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @Body() createUploadDto: CreateUploadDto & { oldUrl: string },
    @UploadedFile() file: Express.Multer.File,
    @UserLoggin() u: UserDocument,
  ) {
    return this.uploadService.uploadPublicFile(
      file.buffer,
      file?.originalname,
      file.mimetype,
      {
        rawProjectId: createUploadDto?.projectId,
        oldUrl: createUploadDto?.oldUrl,
        projectId: new Types.ObjectId(),
        ownerId: u?._id,
      },
    );
  }

  @Get()
  findAll() {
    return this.uploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadService.update(+id, updateUploadDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.uploadService.remove(key);
  }
}
