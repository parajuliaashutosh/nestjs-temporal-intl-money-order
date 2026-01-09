import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TemporalModule } from '../infrastructure/temporal/temporal.module';
import { ReceiverModule } from '../receiver/receiver.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UserModule } from '../user/user.module';
import { MoneyOrder } from './entity/money-order.entity';
import { MoneyOrderController } from './gateway/rest/money-order.controller';
import { MONEY_ORDER_FACTORY } from './money-order.constant';
import { AusMoneyOrderService } from './service/aus/aus-money-order.service';
import { MoneyOrderFactory } from './service/money-order.factory';
import { UsaMoneyOrderService } from './service/usa/usa-money-order.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MoneyOrder]),
        ReceiverModule,
        SystemConfigModule,
        UserModule,
        TemporalModule,
        AuthModule
    ],
    providers: [UsaMoneyOrderService, AusMoneyOrderService, {
        provide: MONEY_ORDER_FACTORY,
        useClass: MoneyOrderFactory
    }],
    exports: [MONEY_ORDER_FACTORY],
    controllers: [MoneyOrderController],
})
export class MoneyOrderModule {}
