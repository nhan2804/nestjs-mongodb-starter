import { Test, TestingModule } from '@nestjs/testing';
import { GroupQuestionService } from './group-question.service';

describe('GroupQuestionService', () => {
  let service: GroupQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupQuestionService],
    }).compile();

    service = module.get<GroupQuestionService>(GroupQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
