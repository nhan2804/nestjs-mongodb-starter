import { Module } from '@nestjs/common';
import { GroupQuestionService } from './group-question.service';
import { GroupQuestionController } from './group-question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GroupQuestion,
  GroupQuestionSchema,
} from './entities/group-question.entity';

@Module({
  controllers: [GroupQuestionController],
  providers: [GroupQuestionService],
  imports: [
    MongooseModule.forFeature([
      { name: GroupQuestion.name, schema: GroupQuestionSchema },
    ]),
  ],
})
export class GroupQuestionModule {}
