import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  ParseArrayPipe,
  Get,
  Patch,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/app/controllers/base.controller';
import { ParseObjectIdPipe } from 'src/app/pipes/validation.pipe';
import { UserLoggin } from 'src/auth/decorators/user';
import { UResult } from 'src/helper/ulti';
import { UserDocument } from 'src/users/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { UsersService } from 'src/users/users.service';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
// import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { PlacesService } from 'src/places/places.service';
import { OptionsService } from 'src/options/options.service';
import { SubmitsService } from 'src/submits/submits.service';

@Controller('projects')
export class ProjectsController extends BaseController<Project> {
  constructor(
    readonly service: ProjectsService,
    readonly placeService: PlacesService,
    readonly optionService: OptionsService,
    readonly submitService: SubmitsService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super(service);
  }

  @Get('/schema')
  schema(@Param('filter') filter: false, @Param('sort') sort: false) {
    const fields = [
      { name: 'name', type: 'string' },
      { name: 'title', type: 'string' },
    ];
    if (filter) {
      fields.concat([
        { name: 'description', type: 'string' },
        { name: 'owner', type: 'string' },
      ]);
    }

    return UResult(true, '', fields);
  }
  @Get()
  //current user
  async getALl(@UserLoggin() user: UserDocument) {
    return this.service.baseFilter();
  }
  @Get(':projectId/users')
  //current user
  async getUsers(
    @UserLoggin() user: UserDocument,
    @Param('projectId') projectId: string,
  ) {
    const project = await this.service.findOneById(projectId);
    const users = await this.userService.baseFilter({
      _id: { $in: project.payload.userIds },
    });
    return users;
  }
  @Post(':projectId/users')
  //current user
  async addUsers(
    @UserLoggin() user: UserDocument,
    @Body('users') users: string[],
    @Param('projectId') projectId: string,
  ) {
    return this.service.addUserToProject(projectId, users);
  }
  @Delete(':projectId/users')
  //current user
  async delUsers(
    @UserLoggin() user: UserDocument,
    @Body('users') users: string[],
    @Param('projectId') projectId: string,
  ) {
    return this.service.removeUserFromProject(projectId, users);
  }
  @Get(':projectId/users/qcs')
  //current user
  async getQc(
    @UserLoggin() user: UserDocument,
    @Param('projectId') projectId: string,
    @Query() query: { type: string },
  ) {
    const project = await this.service.findOneById(projectId);
    const users = await this.userService.findAll({
      _id: { $in: project.payload?.userIds },
      type: query?.type || 'QC',
    });
    return users;
  }
  @Post(':projectId/users/qcs')
  //current user
  async addQc(
    @UserLoggin() user: UserDocument,
    @Body()
    body: {
      username: string;
      password: string;
      fullName: string;
      type: string;
    },
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    const exist = await this.userService.findOne({
      username: body.username,
    });
    console.log(exist);

    if (exist) throw new BadRequestException('username already exist');
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      body.password?.trim(),
      saltOrRounds,
    );
    const newUser = await this.userService.create({
      ...body,
      // type: 'QC',
      password: hashedPassword,
      projectId,
      passwordRaw: body?.password,
    });
    return await this.service.addUserToProject(projectId, [newUser._id]);
  }
  @Post(':projectId/users/qcs/many')
  async addManyQc(
    @UserLoggin() user: UserDocument,
    @Body()
    body: {
      username: string;
      password: string;
      fullName: string;
      type: string;
    }[],
    @Param('projectId', ParseObjectIdPipe) projectId: Types.ObjectId,
  ) {
    const arr = [];
    for (const e of body) {
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(
        e.password?.trim(),
        saltOrRounds,
      );
      try {
        const newUser = await this.userService.create({
          ...e,
          username: e?.username + projectId?.toString(),
          type: e?.type || 'QC',
          password: hashedPassword,
          projectId,
          passwordRaw: e?.password,
        });
        arr.push(newUser);
      } catch (error) {}
    }

    return await this.service.addUserToProject(
      projectId,
      arr.map((e) => e?._id),
    );
  }
  @Delete(':projectId/users/qcs/:qcId')
  //current user
  async delOneQc(
    @UserLoggin() user: UserDocument,
    @Param('projectId') projectId: string,
    @Param('qcId') qcId: string,
  ) {
    await this.service.removeUserFromProject(projectId, [qcId]);
    return await this.userService.deleteOne(qcId);
  }
  @Delete(':projectId/users/qcs')
  //current user
  async delQc(
    @UserLoggin() user: UserDocument,
    @Body('users') users: string[],
    @Param('projectId') projectId: string,
  ) {
    await this.service.removeUserFromProject(projectId, users);
    return await this.userService.baseDeleteMany({
      _id: { $in: users?.map((u) => new Types.ObjectId(u)) },
    });
  }
  @Post()
  //current user
  async create(@Body() req: Project, @UserLoggin() user: UserDocument) {
    // Validate req
    // Ex: reset some fields if role of session not allow

    /*Check double xid [redis]*/
    const project = await this.service.create(req);

    return project;
  }
  @Patch('/:id')
  //current user
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: Project,
    @UserLoggin() user: UserDocument,
  ) {
    // Validate req
    // Ex: reset some fields if role of session not allow

    /*Check double xid [redis]*/
    return this.service.baseUpdateOne(id, body);
  }
  @Delete('/:id')
  //current user
  async deleteP(
    @Param('id', ParseObjectIdPipe) id: string,

    @UserLoggin() user: UserDocument,
  ) {
    // Validate req
    // Ex: reset some fields if role of session not allow

    /*Check double xid [redis]*/
    // const s3 = new AWS.S3({
    //   s3BucketEndpoint: true,
    //   endpoint: 'https://sin1.contabostorage.com/bsc-qc',
    // });
    // const delFolder = await s3.deleteObject({
    //   Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
    //   Key: id?.toString(),
    // });
    await this.service.deleteOne(id);
    await this.optionService.baseDeleteMany({ projectId: id });
    await this.submitService.baseDeleteMany({ projectId: id });
    await this.placeService.baseDeleteMany({ projectId: id });
  }

  @Post('/import')
  import(
    @Body(new ParseArrayPipe({ items: Project }))
    req,
  ) {
    return this.service.baseCreateArray(req);
  }

  @Put('/many')
  updateMany(@Body('search') filter: Project, @Body('update') req) {
    // filter the sam with filter router
    // Validate req
    // Ex: reset some fields if role of session not allow
    return this.service.baseUpdateMany(filter, req);
  }
  @Put('/array')
  updateArray(@Body() req: []) {
    // Validate req
    // Ex: reset some fields if role of session not allow
    const values = req.map((e: any) => {
      const { id, ...rest } = e;
      return {
        updateOne: {
          filter: { _id: e['_id'] },
          update: { $set: rest },
        },
      };
    });
    return this.service.baseUpdateArray(values);
  }

  @Put(':id')
  updateOnce(@Param('id', ParseObjectIdPipe) id: string, @Body() req: Project) {
    // Validate req
    // Ex: reset some fields if role of session not allow
    return this.service.baseUpdateOne(id, req);
  }
}
