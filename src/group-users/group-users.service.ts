import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/app/controllers/services/base.service';
import { GroupUser, GroupUserDocument } from './entities/group-user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GroupUsersService extends BaseService<GroupUser> {
  constructor(
    @InjectModel(GroupUser.name)
    readonly optionModel: Model<GroupUserDocument>,
  ) {
    super(optionModel);
  }
}
