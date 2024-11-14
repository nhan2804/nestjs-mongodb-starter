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
import { AuthSessionsService } from './auth-sessions.service';
import { CreateAuthSessionDto } from './dto/create-auth-session.dto';
import { UpdateAuthSessionDto } from './dto/update-auth-session.dto';
import { AuthSession } from './entities/auth-sessions.entity';
import getSortObjFromQuery from 'src/helper/getSortObjFromQuery';
import {
  ParseArrayObjectIdPipe,
  ParseObjectIdPipe,
} from 'src/app/pipes/validation.pipe';
import { Types } from 'mongoose';
import SortPaginate from 'src/app/types/sort-paginate';
import { UserLoggin } from 'src/auth/decorators/user';
import { UserDocument } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Controller('auth-session')
export class AuthSessionsController {
  constructor(
    private readonly authSessionsService: AuthSessionsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // @Post()
  // create(@Body() createAuthSessionDto: CreateAuthSessionDto) {
  //   return this.authSessionsService.create(createAuthSessionDto);
  // }
  // @Post('bulk/create')
  // createBulk(@Body() createAuthSessionDto: CreateAuthSessionDto[]) {
  //   return this.authSessionsService.createArray(createAuthSessionDto);
  // }
  @Get()
  async findAll(
    @Query()
    query: (AuthSession & SortPaginate) | any,
    @UserLoggin() u: UserDocument,
  ) {
    const sortObj = getSortObjFromQuery(query?.sort);
    delete query?.sort;
    const queries = {
      ...query,
      ...(query?.name && {
        name: { $regex: query?.name?.normalize(), $options: 'i' },
      }),

      // ...(query?.ownerId && {
      ownerId: new Types.ObjectId(u?._id),
      // }),
      ...(Number(query?.startTime) &&
        Number(query?.endTime) && {
          createdAt: {
            $gte: new Date(Number(query?.startTime)),
            $lte: new Date(Number(query?.endTime)),
          },
        }),
    };
    const rs = await this.authSessionsService.findAll(queries, {}, sortObj);
    return rs.map((e) => {
      let expired = false;
      try {
        this.jwtService.verify(e.accessToken, {
          secret: this.configService.get('JWT_SECRET'),
        });
      } catch (error) {
        expired = true;
      }
      return {
        ...e.toObject(),
        expired,
        accessToken: undefined,
      };
    });
    return rs;
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.authSessionsService.findOneById(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateAuthSessionDto: UpdateAuthSessionDto,
  // ) {
  //   return this.authSessionsService.updateOne(id, updateAuthSessionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authSessionsService.deleteOneById(id);
  // }
  // @Delete('bulk/delete')
  // deleteBulk(@Body('ids', ParseArrayObjectIdPipe) ids: Types.ObjectId[]) {
  //   return this.authSessionsService.deleteMany({
  //     _id: {
  //       $in: ids,
  //     },
  //   });
  // }
}
