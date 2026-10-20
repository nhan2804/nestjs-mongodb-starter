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
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { AuditLog } from './entities/audit-logs.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  findAll(@Query() query: any) {
    const page = query?.page ? Number(query.page) : 1;
    const perPage = query?.perPage ? Number(query.perPage) : 20;
    const sortObj = query?.sort ? getSortObjFromQuery(query.sort) : { createdAt: -1 };

    const queries: any = {};
    if (query?.entityType) queries.entityType = query.entityType;
    if (query?.entityId) queries.entityId = query.entityId;
    if (query?.actorId) queries.actorId = query.actorId;
    if (query?.action) queries.action = query.action;

    if (query?.startDate || query?.endDate) {
      queries.createdAt = {};
      if (query?.startDate) queries.createdAt.$gte = new Date(query.startDate);
      if (query?.endDate) queries.createdAt.$lte = new Date(query.endDate);
    } else if (Number(query?.startTime) && Number(query?.endTime)) {
      queries.createdAt = {
        $gte: new Date(Number(query.startTime)),
        $lte: new Date(Number(query.endTime)),
      };
    }

    return this.auditLogsService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      page,
      perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.auditLogsService.findOneById(id);
  }
}
