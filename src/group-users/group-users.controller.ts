import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupUsersService } from './group-users.service';
import { CreateGroupUserDto } from './dto/create-group-user.dto';
import { UpdateGroupUserDto } from './dto/update-group-user.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
@Controller('projects/:projectId/group-users')
export class GroupUsersController {
  constructor(private readonly groupUserService: GroupUsersService) {}

  @Post()
  create(
    @Body() createGroupUserDto: CreateGroupUserDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    const userIds =
      createGroupUserDto?.usersId?.map((e) => new Types.ObjectId(e)) ||
      undefined;
    return this.groupUserService.create({
      ...createGroupUserDto,
      projectId,
      usersId: userIds,
    });
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.groupUserService.findAll({ projectId }).populate('users');
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.groupUserService.findOne(id);
  }

  @Patch(':id')
  update(
    @Body() updateGroupUserDto: UpdateGroupUserDto,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.groupUserService.updateOne(id, updateGroupUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.groupUserService.deleteOne(id);
  }
}
