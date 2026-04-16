import Base from '@/src/common/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { LoginLogModel } from '../model/login-log.model';

@Entity('login_log')
export class LoginLog extends Base implements LoginLogModel {
  @Column({ name: 'login_at', nullable: true })
  loginAt: Date;

  @Column({ name: 'logout_at', nullable: true })
  logoutAt: Date;

  @Column({ name: 'ip', nullable: true })
  ip: string;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @Column({ name: 'loc', nullable: true })
  location: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'region', nullable: true })
  region: string;

  @Column({ name: 'country', nullable: true })
  country: string;

  @Column({ name: 'org', nullable: true })
  asn: string;

  @Column({ name: 'timezone', nullable: true })
  timezone: string;

  // device info
  @Column({ name: 'os', nullable: true })
  os: string;

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @Column({ name: 'raw_user_agent' })
  rawUserAgent: string;

  @ManyToOne(() => Auth, (auth) => auth.loginLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;
}
