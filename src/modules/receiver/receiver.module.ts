import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { Receiver } from './entity/receiver.entity';
import { ReceiverController } from './gateway/rest/receiver.controller';
import { RECEIVER_SERVICE } from './receiver.constant';
import { ReceiverService } from './service/receiver.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receiver]),
    UserModule,
    AuthModule
  ],
  providers: [{
    provide: RECEIVER_SERVICE,
    useClass: ReceiverService,
  }],
  exports: [RECEIVER_SERVICE],
  controllers: [ReceiverController]
})
export class ReceiverModule {}
