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
import { CitizensService } from './citizens.service';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { Citizen } from './entities/citizens.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import { UserLoggin } from 'src/auth/decorators/user';
import { buildVietnameseRegex } from 'src/helper/vietnameseRegex';

@Controller('citizens')
export class CitizensController {
  constructor(private readonly citizensService: CitizensService) {}

  @Post('import/preview')
  previewImport(
    @Body()
    body: {
      sessionId: string;
      year: number;
      month: number;
      records: any[];
    },
  ) {
    return this.citizensService.previewImport(body);
  }

  @Post('import')
  executeImport(
    @Body()
    body: {
      sessionId: string;
      year: number;
      month: number;
      records: any[];
    },
    @UserLoggin() user: any,
  ) {
    return this.citizensService.executeImport(body, user);
  }

  @Post()
  create(@Body() createCitizenDto: CreateCitizenDto) {
    return this.citizensService.create(createCitizenDto as any);
  }

  @Get()
  findAll(@Query() query: any) {
    const page = query?.page ? Number(query.page) : 1;
    const perPage = query?.perPage ? Number(query.perPage) : 20;
    const sortObj = query?.sort ? getSortObjFromQuery(query.sort) : { index: 1, createdAt: -1 };

    const filter: any = {};
    if (query?.village) {
      filter.village = query.village;
    }
    if (query?.search) {
      const q = query.search.trim();
      const regex = buildVietnameseRegex(q);
      filter.$or = [
        { fullName: { $regex: regex } },
        { _id: { $regex: q, $options: 'i' } },
        { village: { $regex: regex } },
      ];
      if (!isNaN(Number(q))) {
        filter.$or.push({ index: Number(q) }, { idx: Number(q) });
      }
    }

    return this.citizensService.findAllWithPaginate(
      filter,
      {},
      sortObj,
      page,
      perPage,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citizensService.findOne({ _id: id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCitizenDto: UpdateCitizenDto) {
    return this.citizensService.updateOne(id, updateCitizenDto as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citizensService.deleteOneById(id);
  }
}
