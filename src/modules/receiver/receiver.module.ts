import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Receiver } from './entity/receiver.entity';
import { RECEIVER_SERVICE } from './receiver.constant';
import { ReceiverService } from './service/receiver.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receiver]),
    UserModule
  ],
  providers: [{
    provide: RECEIVER_SERVICE,
    useClass: ReceiverService,
  }]
})
export class ReceiverModule {}
