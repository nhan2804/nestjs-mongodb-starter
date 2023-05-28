import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { CreateSubmitDto } from './dto/create-submit.dto';
import { UpdateSubmitDto } from './dto/update-submit.dto';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import { UserLoggin } from 'src/auth/decorators/user';
import { UserDocument } from 'src/users/entities/user.entity';
import { PlacesService } from 'src/places/places.service';
import { LogsubmitsService } from 'src/logsubmits/logsubmits.service';
import { UsersService } from 'src/users/users.service';
import getDifferingProperties from 'src/helper/findDiffPropObj';

@Controller('projects/:projectId/submits')
export class SubmitsController {
  constructor(
    private readonly submitsService: SubmitsService,
    private readonly logSubmitsService: LogsubmitsService,
    private readonly placeService: PlacesService,
    private readonly userService: UsersService,
  ) {}

  @Post(':placeId')
  async create(
    @Body() createSubmitDto: { data: any; location: string; checkInId: string },
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @UserLoggin() u: UserDocument,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
  ) {
    const place = await this.placeService.findOne({ _id: placeId });
    place.timeCheckOut = new Date();
    place.save();
    return this.submitsService.create({
      projectId,
      ownerId: new Types.ObjectId(u?._id),
      data: createSubmitDto?.data,
      placeId,
      region: place?.region,
      checkInId: new Types.ObjectId(createSubmitDto?.checkInId),
    });
  }

  @Get(`overview`)
  overview(@Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId) {
    // return this.submitsService.overview(projectId);
    return this.submitsService.overview(projectId);
  }
  @Get()
  findAll(
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Query() query: CreateSubmitDto | any,
  ) {
    const queries = {
      ...query,

      ...(query?.placeId && {
        placeId: new Types.ObjectId(query?.placeId),
      }),
      ...(query?.ownerId && {
        ownerId: new Types.ObjectId(query?.ownerId),
      }),

      ...(Number(query?.startTime) &&
        Number(query?.endTime) && {
          createdAt: {
            $gte: new Date(Number(query?.startTime)),
            $lte: new Date(Number(query?.endTime)),
          },
        }),
    };
    return this.submitsService
      .findAll({ projectId, ...queries })
      .populate('place owner checkin');
  }
  @Get(':placeId/today')
  today(
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
    return this.submitsService.findOne({
      ownerId: new Types.ObjectId(u?._id),
      projectId,
      createdAt: { $gte: startOfToday },
      placeId,
    });
  }
  @Get(':placeId/checkin/:checkInId')
  getSubmitByCheckin(
    @UserLoggin() u: UserDocument,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
    @Param('checkInId', ParseObjectIdPipe) checkInId: Types.ObjectId,
  ) {
    return this.submitsService
      .findAll({
        // projectId,
        checkInId: checkInId,
        // placeId: placeId,
      })
      .populate('checkin');
  }
  @Get(':placeId/data/:id')
  findOne(
    @UserLoggin() u: UserDocument,
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.submitsService.findOne({
      _id: id,
      projectId,
    });
  }
  @Patch(':placeId/data/:id')
  async update(
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
    @Param('placeId', ParseObjectIdPipe) placeId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) submitId: Types.ObjectId,
    @Body() updateSubmitDto: { data: any; location: string },
    @UserLoggin() u: UserDocument,
  ) {
    // const u
    const dataOld = await this.submitsService.findOne({ _id: submitId });
    const diffData = getDifferingProperties(
      updateSubmitDto?.data,
      dataOld?.data,
    );
    if (Object.keys(diffData || {})?.length === 0) {
      throw new BadRequestException(
        'Data không thay đổi, không có gì để update!',
      );
    }
    await this.submitsService.updateOne(submitId, {
      data: updateSubmitDto?.data,
      location: updateSubmitDto?.location,
      updatorId: new Types.ObjectId(u?._id),
    });

    // const dataNew = await this.submitsService.findOne({ _id: submitId });

    const oldDataObj = {};
    Object.keys(diffData).map((e) => {
      oldDataObj[e] = dataOld?.data?.[e];
    });
    const removeTime = { createdAt: undefined, updatedAt: undefined } as any;
    await this.logSubmitsService.create({
      ...dataOld,
      ...removeTime,
      data: diffData,
      oldData: oldDataObj,
      updatorId: new Types.ObjectId(u?._id),
      submitId: submitId,
    });
  }
  @Delete(':id')
  async delete(
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,

    @Param('id', ParseObjectIdPipe) submitId: Types.ObjectId,

    @UserLoggin() u: UserDocument,
  ) {
    // const u
    const dataOld = await this.submitsService.deleteOneById(submitId);
    await this.logSubmitsService.baseDeleteMany({
      submitId,
    });
    return dataOld;
  }
}
