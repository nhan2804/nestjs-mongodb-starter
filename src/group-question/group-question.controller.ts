import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupQuestionService } from './group-question.service';
import { CreateGroupQuestionDto } from './dto/create-group-question.dto';
import { UpdateGroupQuestionDto } from './dto/update-group-question.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
@Controller('projects/:projectId/group-question')
export class GroupQuestionController {
  constructor(private readonly groupQuestionService: GroupQuestionService) {}

  @Post()
  create(
    @Body() createGroupQuestionDto: CreateGroupQuestionDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.groupQuestionService.create({
      ...createGroupQuestionDto,
      projectId,
    });
  }
  @Post('change-position')
  async changePosition(
    @Body() createOptionDto: any,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.groupQuestionService.changePosition(createOptionDto);
    // const
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.groupQuestionService.findAll(
      { projectId },
      undefined,
      undefined,
      {
        position: 1,
      },
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.groupQuestionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Body() updateGroupQuestionDto: UpdateGroupQuestionDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.groupQuestionService.updateOne(id, updateGroupQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.groupQuestionService.deleteOne(id);
  }
}
