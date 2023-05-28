import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LogsubmitsService } from './logsubmits.service';
import { CreateLogsubmitDto } from './dto/create-logsubmit.dto';
import { UpdateLogsubmitDto } from './dto/update-logsubmit.dto';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
@Controller('projects/:projectId/submits/:submitId/logs')
export class LogsubmitsController {
  constructor(private readonly logsubmitsService: LogsubmitsService) {}

  @Post()
  create(@Body() createLogsubmitDto: CreateLogsubmitDto) {
    return this.logsubmitsService.create(createLogsubmitDto);
  }

  @Get()
  findAll(@Param('submitId', ParseObjectIdPipe) submitId: Types.ObjectId) {
    return this.logsubmitsService
      .findAll({ submitId: submitId })
      .populate('updator');
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.logsubmitsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateLogsubmitDto: UpdateLogsubmitDto,
  ) {
    return this.logsubmitsService.updateOne(id, updateLogsubmitDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.logsubmitsService.deleteOne(id);
  }
}
