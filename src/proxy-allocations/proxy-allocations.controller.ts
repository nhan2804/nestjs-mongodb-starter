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
import { ProxyAllocationsService } from './proxy-allocations.service';
import { CreateProxyAllocationDto } from './dto/create-proxy-allocation.dto';
import { UpdateProxyAllocationDto } from './dto/update-proxy-allocation.dto';
import { ProxyAllocation } from './entities/proxy-allocations.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
@Controller('proxy-allocations')
export class ProxyAllocationsController {
  constructor(private readonly proxyAllocationsService: ProxyAllocationsService) {}

  @Post()
  create(@Body() createProxyAllocationDto: CreateProxyAllocationDto) {
    return this.proxyAllocationsService.create(createProxyAllocationDto);
  }
  @Post('bulk/create')
  createBulk(@Body() createProxyAllocationDto: CreateProxyAllocationDto[]) {
    return this.proxyAllocationsService.createArray(createProxyAllocationDto);
  }
  @Get()
  findAll(
    
    @Query()
    query: (ProxyAllocation & SortPaginate) | any,
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
    return this.proxyAllocationsService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      query?.page,
      query?.perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.proxyAllocationsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProxyAllocationDto: UpdateProxyAllocationDto) {
    return this.proxyAllocationsService.updateOne(id, updateProxyAllocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proxyAllocationsService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.proxyAllocationsService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
