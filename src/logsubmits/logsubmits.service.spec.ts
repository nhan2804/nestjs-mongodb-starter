import { Test, TestingModule } from '@nestjs/testing';
import { LogsubmitsService } from './logsubmits.service';

describe('LogsubmitsService', () => {
  let service: LogsubmitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsubmitsService],
    }).compile();

    service = module.get<LogsubmitsService>(LogsubmitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
