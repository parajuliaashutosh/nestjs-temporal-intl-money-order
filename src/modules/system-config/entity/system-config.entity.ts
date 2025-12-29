import Base from '@/src/common/entity/base.entity';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Column, Entity } from 'typeorm';

@Entity('system_config')
export class SystemConfig extends Base {
  @Column({
    type: 'enum',
    enum: SupportedCountry,
    name: 'country_code',
    nullable: false,
  })
  countryCode: SupportedCountry;

  @Column({
    type: 'enum',
    enum: SupportedCurrency,
    name: 'currency',
    nullable: false,
  })
  currency: SupportedCurrency;

  @Column({ name: 'exchange_rate', type: 'float' })
  exchangeRate: number;
}
