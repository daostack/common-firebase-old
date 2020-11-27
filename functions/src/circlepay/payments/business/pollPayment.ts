import { IPaymentEntity } from '../types';
import { ArgumentError } from '../../../util/errors';
import { externalRequestExecutor, poll } from '../../../util';
import { CirclePaymentStatus } from '../../../util/types';
import axios from 'axios';
import { circlePayApi } from '../../../settings';
import { ErrorCodes } from '../../../constants';
import { getCirclePayOptions } from '../../circlepay';
import { ICirclePayment } from '../../types';

interface IPollPaymentOptions {
  interval: number;
  maxRetries: number;

  /**
   * Whether an error will be throw if the payment is finalized, but
   * the status is failed
   */
  throwOnePaymentFailed: boolean;
}

const defaultPaymentOptions: IPollPaymentOptions = {
  interval: 60,
  maxRetries: 32,
  throwOnePaymentFailed: false
};

/**
 * Polls payment until the payment reaches desired state
 *
 * @param payment
 * @param pollPaymentOptions
 */
export const pollPayment = async (payment: IPaymentEntity, pollPaymentOptions?: IPollPaymentOptions): Promise<IPaymentEntity> => {
  if (!payment) {
    throw new ArgumentError('payment', payment);
  }

  const headers = await getCirclePayOptions();
  const options = {
    ...defaultPaymentOptions,
    ...pollPaymentOptions
  };

  const pollFn = async (): Promise<CirclePaymentStatus> => {
    const response = await externalRequestExecutor<ICirclePayment>(async () => {
      return (await axios.get<ICirclePayment>(`${circlePayApi}/payments/${payment.circlePaymentId}`, headers)).data;
    }, {
      errorCode: ErrorCodes.CirclePayError,
      message: 'Polling circle call failed'
    });

    return response.data.status;
  };

  const validateFn = (status: CirclePaymentStatus): boolean => {
    return ['confirmed', 'failed', 'paid'].some(s => s === status);
  };

  const status = await poll<CirclePaymentStatus>(pollFn, validateFn, options.interval, options.maxRetries);

  // @todo Update payment
  // @todo Event
  // @todo Return the updated payment

  return payment;
};