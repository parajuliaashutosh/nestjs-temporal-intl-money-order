import Base from '@/src/common/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { DevicePlatform } from '../device-config.constant';

@Entity()
export class DeviceConfig extends Base {
  @Column({ type: 'text', nullable: true })
  fcm: string;

  @Column({ type: 'text', nullable: true })
  deviceId: string;

  @Column({ type: 'enum', enum: DevicePlatform, nullable: true })
  platform: DevicePlatform;

  @ManyToOne(() => Auth, (auth) => auth.deviceConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;

  @Column({ name: 'badge_count', default: 0 })
  badgeCount: number;
}
