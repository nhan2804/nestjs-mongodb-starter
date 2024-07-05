import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ShortensService } from './shortens.service';
import { CreateShortenDto } from './dto/create-shorten.dto';
import { UpdateShortenDto } from './dto/update-shorten.dto';
import { Shorten } from './entities/shortens.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
import { Response } from 'express';
import { Public } from 'src/auth/guards/public';
import { customAlphabet, nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
@Controller('shortens')
export class ShortensController {
  constructor(
    private readonly shortensService: ShortensService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post()
  create(@Body() createShortenDto: CreateShortenDto) {
    const code = nanoid(4);

    return this.shortensService.create({
      ...createShortenDto,
      code,
      link: `${this.configService.get('DOMAIN')}r/${code}`,
    });
  }
  @Post('bulk/create')
  createBulk(@Body() createShortenDto: CreateShortenDto[]) {
    return this.shortensService.createArray(createShortenDto);
  }

  @Get('/r/:shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const shorten = await this.shortensService.findOne({ code: shortUrl });
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta property="og:url" content="${shorten.originLink}" />
        <meta property="og:title" content="Check out this link!" />
        <meta property="og:description" content="A great link to visit." />
        <meta property="og:image" content="URL_TO_AN_IMAGE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Check out this link!" />
        <meta name="twitter:description" content="A great link to visit." />
        <meta name="twitter:image" content="URL_TO_AN_IMAGE" />
        <meta http-equiv="refresh" content="0; url=${shorten.originLink}" />
      </head>
      <body>
      </body>
      </html>
    `;
    res.send(html);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.shortensService.findOne({ id });
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShortenDto: UpdateShortenDto) {
    return this.shortensService.updateOne(id, updateShortenDto);
  }
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shortensService.deleteOneById(id);
  }
  @Delete('bulk/delete')
  deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
    return this.shortensService.deleteMany({
      _id: {
        $in: ids,
      },
    });
  }
}
