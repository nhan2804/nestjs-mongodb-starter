import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/app/controllers/services/base.service';
import {
  GroupQuestion,
  GroupQuestionDocument,
} from './entities/group-question.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GroupQuestionService extends BaseService<GroupQuestion> {
  constructor(
    @InjectModel(GroupQuestion.name)
    readonly optionModel: Model<GroupQuestionDocument>,
  ) {
    super(optionModel);
  }
}
