import { IPaymentEntity } from '../../../../../circlepay/payments/types';

jest.mock('../../../../../circlepay/payments/database/updatePayment', () => ({
  updatePaymentInDatabase: jest.fn()
    .mockImplementation((card: IPaymentEntity): Promise<IPaymentEntity> => Promise.resolve(card))
}));