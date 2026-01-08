import { Test, TestingModule } from '@nestjs/testing';
import { UsaMoneyOrderService } from './usa-money-order.service';

describe('UsaMoneyOrderService', () => {
  let service: UsaMoneyOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsaMoneyOrderService],
    }).compile();

    service = module.get<UsaMoneyOrderService>(UsaMoneyOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
