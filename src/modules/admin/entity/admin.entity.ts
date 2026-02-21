import Base from 'src/common/entity/base.entity';
import { Auth } from 'src/modules/auth/entity/auth.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { AdminModel } from '../model/admin.model';

@Entity('admin')
export class Admin extends Base implements AdminModel {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @OneToOne(() => Auth, (auth) => auth.admin, {
    cascade: true,
  })
  auth: Auth;
}
