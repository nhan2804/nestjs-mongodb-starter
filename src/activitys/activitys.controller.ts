import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ActivitysService } from './activitys.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activitys.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
import { Public } from 'src/auth/guards/public';
import { EventPattern, Payload } from '@nestjs/microservices';
@Controller('activities')
export class ActivitysController {
  constructor(private readonly activitysService: ActivitysService) {}
  @Public()
  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitysService.create(createActivityDto);
  }
  @EventPattern('activities.created')
  hello(createActivityDto: CreateActivityDto) {
    console.log('recive message', createActivityDto);

    this.activitysService.create(createActivityDto);
    return { message: 'Ok' };
  }
  @Post('bulk/create')
  createBulk(@Body() createActivityDto: CreateActivityDto[]) {
    return this.activitysService.createArray(createActivityDto);
  }
  @Get()
  findAll(
    @Query()
    query: (Activity & SortPaginate) | any,
  ) {
    const sortObj = getSortObjFromQuery(query?.sort);
    delete query?.sort;
    const queries = {
      ...query,
      ...(query?.name && {
        name: { $regex: query?.name?.normalize(), $options: 'i' },
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
    return this.activitysService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      query?.page,
      query?.perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.activitysService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitysService.updateOne(id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activitysService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.activitysService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
