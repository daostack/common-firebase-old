import { IPaymentEntity } from '../types';

const successfulStatuses = ['confirmed', 'paid'];
const terminalStatuses = ['paid', 'failed'];

export const isSuccessful = (payment: IPaymentEntity): boolean =>
  successfulStatuses.some(status => status === payment.status);

export const isFinalized = (payment: IPaymentEntity): boolean =>
  terminalStatuses.some(status => status === payment.status);