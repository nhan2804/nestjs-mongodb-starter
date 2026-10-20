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
import { ExamSessionsService } from './exam-sessions.service';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { ExamSession } from './entities/exam-sessions.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';

@Controller('exam-sessions')
export class ExamSessionsController {
  constructor(private readonly examSessionsService: ExamSessionsService) {}

  @Post()
  create(@Body() createExamSessionDto: CreateExamSessionDto) {
    return this.examSessionsService.create(createExamSessionDto as any);
  }

  @Get()
  async findAll(@Query() query: any) {
    const page = query?.page ? Number(query.page) : 1;
    const perPage = query?.perPage ? Number(query.perPage) : (query?.all ? 1000 : 50);
    const sortObj = query?.sort ? getSortObjFromQuery(query.sort) : { createdAt: -1 };

    const filter: any = {};
    if (query?.year) filter.year = Number(query.year);
    if (query?.phase) filter.phase = query.phase;
    if (query?.serviceType) filter.serviceType = query.serviceType;
    if (query?.isActive !== undefined && query?.isActive !== '') {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }
    if (query?.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    return this.examSessionsService.findAllWithPaginate(
      filter,
      {},
      sortObj,
      page,
      perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examSessionsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamSessionDto: UpdateExamSessionDto) {
    return this.examSessionsService.updateOne(id, updateExamSessionDto as any);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.examSessionsService.setActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examSessionsService.deleteOneById(id);
  }
}
