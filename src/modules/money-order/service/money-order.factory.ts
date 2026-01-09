import { SupportedCountry } from "@/src/common/enum/supported-country.enum";
import { AppException } from "@/src/common/exception/app.exception";
import { Injectable } from "@nestjs/common";
import { MoneyOrderContract } from "../contract/money-order.contract";
import { AusMoneyOrderService } from "./aus/aus-money-order.service";
import { UsaMoneyOrderService } from "./usa/usa-money-order.service";

@Injectable()
export class MoneyOrderFactory {

    constructor(
        private readonly usaMoneyOrderService: UsaMoneyOrderService,
        private readonly ausMoneyOrderService: AusMoneyOrderService,
    ) {}

    getMoneyOrderService(countryCode: SupportedCountry): MoneyOrderContract {
        switch (countryCode) {
            case  SupportedCountry.USA:
                return this.usaMoneyOrderService;
            case SupportedCountry.AUS:
                return this.ausMoneyOrderService;
            default:
                throw AppException.badRequest('Unsupported country code');
        }
    }
}