import { Utils } from '../util/util';
import { createAPayment } from './circlepay';
import { updateCard } from '../db/cardDb';
import { updatePayment } from '../db/paymentDb';
import {ethers} from 'ethers';
import v4 from 'uuid';

interface IPaymentResp {
  id: string,
  type: string,
  source: {id: string, type: string},
  amount: {amount: string, currency: string},
  status: string,
  refunds: string[],
  createDate: string,
  updateDate: string,
}

const _updatePayment = async (paymentResponse: IPaymentResp, proposalId: string) : Promise<any> => {
  const doc = {
    id: paymentResponse.id,
    type: paymentResponse.type,
    proposalId,
    source: paymentResponse.source,
    amount: paymentResponse.amount,
    status: paymentResponse.status, // need to see when&how updating status
    refunds: paymentResponse.refunds,
    creationDate: paymentResponse.createDate,
    updateDate: paymentResponse.updateDate
  };
  await updatePayment(paymentResponse.id, doc);
}

interface IRequest {
    proposerId: string,
    proposalId: string,
    funding: number,
}

export const createPayment = async (req: IRequest) : Promise<any> => {
  let result = 'Could not process payment.';
  const {proposerId, proposalId, funding} = req;
  const cardData = await Utils.getCardByUserId(proposerId)
  const user = await Utils.getUserById(proposerId);

    const paymentData = {
      idempotencyKey: v4(),
      proposalId,
      metadata: {
        email: user.email, 
        sessionId: ethers.utils.id(proposerId).substring(0,50),
        ipAddress: '127.0.0.1', // request has no ip, fix this
      },
      amount: {
        amount: `${funding}`, // disable create proposal when baklance is 0 in frontend?
        currency: 'USD',
      },
      verification: 'none',
      source: {
        id: cardData.cardId,
        type: 'card'
      },
    }
  
    const {data: data} = await createAPayment(paymentData);
    if (data) {
      _updatePayment(data, proposalId);
      cardData.payments.push(data.id);
      await updateCard(cardData.id, cardData);
      result = 'Payment created. Status: Pending.';
    }

    return result;
}
