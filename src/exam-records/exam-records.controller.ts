import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExamRecordsService } from './exam-records.service';
import { UserLoggin } from 'src/auth/decorators/user';
import { Public } from 'src/auth/guards/public';

@Controller('exam-records')
export class ExamRecordsController {
  constructor(private readonly examRecordsService: ExamRecordsService) {}

  // 1. Static routes FIRST to prevent route collisions
  @Get('summary')
  getSummary(
    @Query('sessionId') sessionId: string,
    @Query('scheduledDate') scheduledDate?: string,
    @Query('village') village?: string,
  ) {
    return this.examRecordsService.getSummary(
      sessionId,
      scheduledDate,
      village,
    );
  }

  @Get('photos/deleted')
  getAllDeletedPhotos(@Query('sessionId') sessionId?: string) {
    return this.examRecordsService.getDeletedPhotos(undefined, sessionId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.examRecordsService.findRecords(query);
  }

  // 2. Specific sub-resource routes
  @Get(':id/photos/deleted')
  getDeletedPhotosForRecord(@Param('id') id: string) {
    return this.examRecordsService.getDeletedPhotos(id);
  }

  @Public()
  @Get(':id/photos/:photoId/trash')
  async serveTrashPhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.examRecordsService.getPhotoFilePath(
      id,
      photoId,
      true,
    );
    res.sendFile(filePath, {
      etag: false,
      lastModified: false,
    });
  }

  @Public()
  @Get(':id/photos/:photoId')
  async servePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.examRecordsService.getPhotoFilePath(
      id,
      photoId,
      false,
    );
    res.sendFile(filePath, {
      etag: false,
      lastModified: false,
    });
  }

  @Patch(':id/attendance')
  updateAttendance(
    @Param('id') id: string,
    @Body('arrived') arrived: boolean,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.updateAttendance(id, arrived, user);
  }

  @Patch(':id/note')
  updateNote(
    @Param('id') id: string,
    @Body('note') note: string,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.updateNote(id, note, user);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/photos')
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.uploadPhoto(id, file, user);
  }

  @Patch(':id/photos/:photoId/primary')
  setPrimaryPhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.setPrimaryPhoto(id, photoId, user);
  }

  @Delete(':id/photos/:photoId')
  deletePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.deletePhoto(id, photoId, user);
  }

  @Post(':id/photos/:photoId/restore')
  restorePhoto(
    @Param('id') id: string,
    @Param('photoId') photoId: string,
    @UserLoggin() user: any,
  ) {
    return this.examRecordsService.restorePhoto(id, photoId, user);
  }

  // 3. Dynamic single record detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examRecordsService.findRecordById(id);
  }
}
