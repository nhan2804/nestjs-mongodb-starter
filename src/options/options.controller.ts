import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';

@Controller('projects/:projectId/options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Post()
  async create(
    @Body() createOptionDto: CreateOptionDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    const groupsIds =
      createOptionDto?.exceptIdsGroup?.map((e) => new Types.ObjectId(e)) ||
      undefined;
    const count = await this.optionsService.countDocument({ projectId });
    return this.optionsService.create({
      ...createOptionDto,
      projectId,
      postition: count + 1,
      exceptIdsGroup: groupsIds,
    });
  }
  @Post('change-position')
  async changePosition(
    @Body() createOptionDto: any,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.optionsService.changePosition(createOptionDto);
    // const
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.optionsService
      .findAll({ projectId }, undefined, undefined, {
        postition: 1,
        // updatedAt: -1,
      })
      .populate(['except']);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    return this.optionsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOptionDto: UpdateOptionDto) {
    console.log({ updateOptionDto });

    return this.optionsService.updateOne(id, updateOptionDto);
    return this.optionsService.baseUpdateOne(id, updateOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.optionsService.deleteOne(id);
  }
}
