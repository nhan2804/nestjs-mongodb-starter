import { Test, TestingModule } from '@nestjs/testing';
import { LogsubmitsController } from './logsubmits.controller';
import { LogsubmitsService } from './logsubmits.service';

describe('LogsubmitsController', () => {
  let controller: LogsubmitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsubmitsController],
      providers: [LogsubmitsService],
    }).compile();

    controller = module.get<LogsubmitsController>(LogsubmitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
