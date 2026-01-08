import { Test, TestingModule } from '@nestjs/testing';
import { AusMoneyOrderService } from './aus-money-order.service';

describe('AusMoneyOrderService', () => {
  let service: AusMoneyOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AusMoneyOrderService],
    }).compile();

    service = module.get<AusMoneyOrderService>(AusMoneyOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
