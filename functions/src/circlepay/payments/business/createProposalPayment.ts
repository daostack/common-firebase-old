import { IProposalPayment } from '../types';
import { NotImplementedError } from '../../../util/errors';
import { createPayment } from '../../createPayment';

export const createProposalPayment = async (): Promise<IProposalPayment> => {
  const payment = await createPayment()

  throw new NotImplementedError();
}