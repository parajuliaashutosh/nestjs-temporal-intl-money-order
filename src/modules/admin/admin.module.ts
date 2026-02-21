import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ADMIN_REPO, ADMIN_SERVICE } from './admin.constant';
import { Admin } from './entity/admin.entity';
import { AdminRepo } from './repo/admin.repo';
import { AdminService } from './service/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  providers: [
    {
      provide: ADMIN_SERVICE,
      useClass: AdminService,
    },
    {
      provide: ADMIN_REPO,
      useClass: AdminRepo,
    },
  ],
  exports: [ADMIN_SERVICE],
})
export class AdminModule {}
