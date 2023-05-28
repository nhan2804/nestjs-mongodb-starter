import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import { UserLoggin } from 'src/auth/decorators/user';
import { UserDocument } from 'src/users/entities/user.entity';
@Controller('projects/:projectId/places/:placeId/checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  create(
    @Body() createCheckinDto: CreateCheckinDto,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @UserLoggin() u: UserDocument,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
  ) {
    return this.checkinService.create({
      ...createCheckinDto,
      projectId,
      timeCheckIn: new Date(),
      ownerId: new Types.ObjectId(u?._id),
      placeId,
    });
  }

  @Get()
  findAll(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    return this.checkinService.findAll({});
  }

  @Get('/today')
  async today(
    @UserLoggin() u: UserDocument,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
  ) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const checkin = await this.checkinService.findOne({
      ownerId: new Types.ObjectId(u?._id),
      projectId,
      createdAt: { $gte: startOfToday },
      placeId,
      timeCheckOut: { $exists: false },
    });
    if (checkin?.timeCheckOut) {
      return null;
    }
    return checkin;
  }
  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    // return this.checkinService.findOne(+id);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Body()
    updatePlaceDto: UpdateCheckinDto & {
      updateTimeCheckIn: Date;
      updateTimeCheckOut: Date;
    },
  ) {
    // const check = sameDay(new Date(place?.timeCheckIn), new Date());
    // if (updatePlaceDto?.updateTimeCheckIn) {
    //   return this.checkinService.baseUpdateOne(id, {
    //     timeCheckIn: new Date(),
    //   });
    // }
    if (updatePlaceDto?.updateTimeCheckOut) {
      return this.checkinService.baseUpdateOne(id, {
        ...updatePlaceDto,
        timeCheckOut: new Date(),
      });
    }
    return this.checkinService.baseUpdateOne(id, updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    // return this.checkinService.remove(+id);
  }
}
