import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyOrder } from './entity/money-order.entity';
import { AusMoneyOrderService } from './service/aus/aus-money-order.service';
import { UsaMoneyOrderService } from './service/usa/usa-money-order.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MoneyOrder]),
    ],
    providers: [UsaMoneyOrderService, AusMoneyOrderService],
    
})
export class MoneyOrderModule {}
