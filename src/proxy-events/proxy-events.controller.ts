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
import { ProxyEventsService } from './proxy-events.service';
import { CreateProxyEventDto } from './dto/create-proxy-event.dto';
import { UpdateProxyEventDto } from './dto/update-proxy-event.dto';
import { ProxyEvent } from './entities/proxy-events.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
@Controller('proxy-events')
export class ProxyEventsController {
  constructor(private readonly proxyEventsService: ProxyEventsService) {}

  @Post()
  create(@Body() createProxyEventDto: CreateProxyEventDto) {
    return this.proxyEventsService.create(createProxyEventDto);
  }
  @Post('bulk/create')
  createBulk(@Body() createProxyEventDto: CreateProxyEventDto[]) {
    return this.proxyEventsService.createArray(createProxyEventDto);
  }
  @Get()
  findAll(
    
    @Query()
    query: (ProxyEvent & SortPaginate) | any,
  ) {
    const sortObj = getSortObjFromQuery(query?.sort);
    delete query?.sort;
    const queries = {
      ...query,
      ...(query?.name && {
        name: { $regex: query?.name?.normalize(), $options: 'i' },
      }),
      
      // ...(query?.ownerId && {
      //   ownerId: new Types.ObjectId(query?.ownerId),
      // }),
      ...(Number(query?.startTime) &&
        Number(query?.endTime) && {
          createdAt: {
            $gte: new Date(Number(query?.startTime)),
            $lte: new Date(Number(query?.endTime)),
          },
        }),
    };
    return this.proxyEventsService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      query?.page,
      query?.perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.proxyEventsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProxyEventDto: UpdateProxyEventDto) {
    return this.proxyEventsService.updateOne(id, updateProxyEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proxyEventsService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.proxyEventsService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
