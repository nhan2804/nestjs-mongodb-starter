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
  NotFoundException,
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
import { nanoid } from 'nanoid';
import { ConfigService } from '@nestjs/config';
@Controller('r')
export class ShortensRedirectController {
  constructor(
    private readonly shortensService: ShortensService,
    private readonly configService: ConfigService,
  ) {}
  @Public()
  @Get('/:shortUrl')
  async redirect(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const shorten = await this.shortensService.findOne({ code: shortUrl });
    if (!shorten) {
      throw new NotFoundException();
    }
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta property="og:url" content="${shorten.originLink}" />
        <meta property="og:title" content="${shorten.name}" />
        <meta property="og:description" content="${shorten.desc}" />
        <meta http-equiv="refresh" content="0; url=${shorten.originLink}" />
         <meta property="og:image" content="${shorten.image}"/>
      </head>
      <body>
      </body>
      </html>
    `;
    res.send(html);
  }
}
