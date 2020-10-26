import uuid from 'uuid';

import { IPaymentEntity, PaymentType } from '../../util/types';
import { createAPayment } from '../circlepay';

interface ICreatePaymentData {
  type: PaymentType;
}

interface ICreatePaymentPayload {
  payment: IPaymentEntity;
};

export const createPayment = async (data: ICreatePaymentData): Promise<ICreatePaymentPayload> => {
  const payment: IPaymentEntity = {
    id: uuid.v4()
  };

  // if (cardData) {
  //   const user = await Utils.getUserById(proposerId);
  //   const paymentData = {
  //     idempotencyKey: v4(),
  //     proposalId,
  //     metadata: {
  //       email: user.email,
  //       sessionId: ethers.utils.id(proposerId).substring(0,50),
  //       ipAddress,
  //     },
  //     amount: {
  //       amount: `${funding}`,
  //       currency: 'USD',
  //     },
  //     verification: 'none',
  //     source: {
  //       id: cardData.cardId,
  //       type: 'card'
  //     },
  //   }

  // const { data } = await createAPayment({
  //
  // });

  // @ts-ignore
  return {

  };
}