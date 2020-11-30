import { CommonError } from './CommonError';
import { ErrorCodes, StatusCodes } from '../../constants';

/**
 * The exception that is thrown when something goes
 * wrong with the payment
 */
export class PaymentError extends CommonError {
  constructor(paymentId: string, circlePaymentId: string, additionalData?: any) {
    super('The payment failed', {
      paymentId,
      circlePaymentId
    });
  }
}