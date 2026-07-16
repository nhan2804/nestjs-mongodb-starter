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
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agents.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }
  @Post('bulk/create')
  createBulk(@Body() createAgentDto: CreateAgentDto[]) {
    return this.agentsService.createArray(createAgentDto);
  }
  @Get()
  findAll(
    
    @Query()
    query: (Agent & SortPaginate) | any,
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
    return this.agentsService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      query?.page,
      query?.perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.agentsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentsService.updateOne(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentsService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.agentsService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
