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
import { __name__(sentenceCase)sService } from './__name__s.service';
import { Create__name__(sentenceCase)Dto } from './dto/create-__name__.dto';
import { Update__name__(sentenceCase)Dto } from './dto/update-__name__.dto';
import { __name__(sentenceCase) } from './entities/__name__s.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
@Controller('__path_api_be__')
export class __name__(sentenceCase)sController {
  constructor(private readonly __name__sService: __name__(sentenceCase)sService) {}

  @Post()
  create(__params_be__@Body() create__name__(sentenceCase)Dto: Create__name__(sentenceCase)Dto) {
    return this.__name__sService.create(create__name__(sentenceCase)Dto);
  }
  @Post('bulk/create')
  createBulk(__params_be__@Body() create__name__(sentenceCase)Dto: Create__name__(sentenceCase)Dto[]) {
    return this.__name__sService.createArray(create__name__(sentenceCase)Dto);
  }
  @Get()
  findAll(
    __params_be__
    @Query()
    query: (__name__(sentenceCase) & SortPaginate) | any,
  ) {
    const sortObj = getSortObjFromQuery(query?.sort);
    delete query?.sort;
    const queries = {
      ...query,
      ...(query?.name && {
        name: { $regex: query?.name?.normalize(), $options: 'i' },
      }),
      __search-param-be__
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
    return this.__name__sService.findAllWithPaginate(
      queries,
      {},
      sortObj,
      query?.page,
      query?.perPage,
    );
  }

  @Get(':id')
  findOne(__params_be__@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.__name__sService.findOneById(id);
  }

  @Patch(':id')
  update(__params_be__@Param('id') id: string, @Body() update__name__(sentenceCase)Dto: Update__name__(sentenceCase)Dto) {
    return this.__name__sService.updateOne(id, update__name__(sentenceCase)Dto);
  }

  @Delete(':id')
  remove(__params_be__@Param('id') id: string) {
    return this.__name__sService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(__params_be__@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.__name__sService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
