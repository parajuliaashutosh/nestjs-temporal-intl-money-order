import { SupportedCountry } from "@/src/common/enum/supported-country.enum";
import { MoneyOrderContract } from "./money-order.contract";

export interface MoneyOrderFactoryContract {
    getMoneyOrderService(countryCode: SupportedCountry): MoneyOrderContract;
}