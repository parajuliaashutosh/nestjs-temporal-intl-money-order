import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import Base from 'src/common/entity/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { AddressModel } from '../model/address.model';

@Entity('address')
export class Address extends Base implements AddressModel {
  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column({
    type: 'enum',
    enum: SupportedCountry,
    name: 'country_code',
    nullable: true,
  })
  country: SupportedCountry;

  @Column({ name: 'address_line_1' })
  addressLine1: string;

  @Column({ nullable: true, name: 'address_line_2' })
  addressLine2?: string;

  @OneToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  user: User;
}
