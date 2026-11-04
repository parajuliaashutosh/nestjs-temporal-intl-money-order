import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { AppException } from '@/src/common/exception/app.exception';

export enum MoneyOrderEvent {
  SCREENING_FAILED = 'SCREENING_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  FUNDS_DEBITED = 'FUNDS_DEBITED',
  PAYOUT_INITIATED = 'PAYOUT_INITIATED',
  PAYOUT_SUCCEEDED = 'PAYOUT_SUCCEEDED',
}

export interface MoneyOrderState {
  status: MoneyOrderStatus;
  deliveryStatus: MoneyOrderDeliveryStatus;
}

interface Transition {
  from: readonly MoneyOrderStatus[];
  to: MoneyOrderState;
}

const TRANSITIONS: Readonly<Record<MoneyOrderEvent, Transition>> = {
  [MoneyOrderEvent.SCREENING_FAILED]: {
    from: [MoneyOrderStatus.INITIATED],
    to: {
      status: MoneyOrderStatus.ON_HOLD,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_NOT_AUTHORIZED,
    },
  },
  [MoneyOrderEvent.INSUFFICIENT_BALANCE]: {
    from: [MoneyOrderStatus.INITIATED],
    to: {
      status: MoneyOrderStatus.ON_HOLD,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_NOT_AUTHORIZED,
    },
  },
  [MoneyOrderEvent.FUNDS_DEBITED]: {
    from: [MoneyOrderStatus.INITIATED],
    to: {
      status: MoneyOrderStatus.PROCESSING,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_AUTHORIZED,
    },
  },
  [MoneyOrderEvent.PAYOUT_INITIATED]: {
    from: [MoneyOrderStatus.PROCESSING],
    to: {
      status: MoneyOrderStatus.PROCESSING,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_INITIATED,
    },
  },
  [MoneyOrderEvent.PAYOUT_SUCCEEDED]: {
    from: [MoneyOrderStatus.PROCESSING],
    to: {
      status: MoneyOrderStatus.COMPLETED,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_COMPLETED,
    },
  },
};

const isApplied = (state: MoneyOrderState, event: MoneyOrderEvent) => {
  const { to } = TRANSITIONS[event];
  return (
    state.status === to.status && state.deliveryStatus === to.deliveryStatus
  );
};

export const MoneyOrderStateMachine = {
  initial(): MoneyOrderState {
    return {
      status: MoneyOrderStatus.INITIATED,
      deliveryStatus: MoneyOrderDeliveryStatus.DELIVERY_NOT_AUTHORIZED,
    };
  },

  can(state: MoneyOrderState, event: MoneyOrderEvent): boolean {
    return (
      isApplied(state, event) || TRANSITIONS[event].from.includes(state.status)
    );
  },

  next(state: MoneyOrderState, event: MoneyOrderEvent): MoneyOrderState | null {
    if (isApplied(state, event)) return null;

    if (!TRANSITIONS[event].from.includes(state.status)) {
      throw AppException.conflict(
        `INVALID_MONEY_ORDER_TRANSITION: ${event} from ${state.status}/${state.deliveryStatus}`,
      );
    }

    return { ...TRANSITIONS[event].to };
  },

  apply(state: MoneyOrderState, event: MoneyOrderEvent): boolean {
    const next = MoneyOrderStateMachine.next(state, event);
    if (!next) return false;

    state.status = next.status;
    state.deliveryStatus = next.deliveryStatus;
    return true;
  },
};
