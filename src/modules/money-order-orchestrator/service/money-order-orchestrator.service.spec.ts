import { Test, TestingModule } from '@nestjs/testing';
import { MoneyOrderOrchestratorService } from './money-order-orchestrator.service';

describe('MoneyOrderOrchestratorService', () => {
  let service: MoneyOrderOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoneyOrderOrchestratorService],
    }).compile();

    service = module.get<MoneyOrderOrchestratorService>(MoneyOrderOrchestratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
