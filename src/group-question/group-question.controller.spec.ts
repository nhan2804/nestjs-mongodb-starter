import { Test, TestingModule } from '@nestjs/testing';
import { GroupQuestionController } from './group-question.controller';
import { GroupQuestionService } from './group-question.service';

describe('GroupQuestionController', () => {
  let controller: GroupQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupQuestionController],
      providers: [GroupQuestionService],
    }).compile();

    controller = module.get<GroupQuestionController>(GroupQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
