import { Utils } from '../util/util';
import { createAPayment } from './circlepay';

export const createPayment = async (req) => {

  let {proposerId, funding} = req.body;

  const cardData = await Utils.getCardByUserId(proposerId)
  console.log('cardData', cardData);
  const user = await Utils.getUserById(proposerId);

    const paymentData = {
      idempotencyKey: '13a19be3-2f23-4626-aab7-ac217f09abd3', //(also in frontend) use commonId for generating this? consider uuid-by-string,
      metadata: {
        email: user.email, 
        sessionId: 'todoHashedSessionId', // hash what though? what hashing func?
        ipAddress: '127.0.0.1',
      },
      amount: {
        amount: `${funding}`,
        currency: 'USD',
      },
      verification: 'none',
      source: {
        id: cardData.cardId,
        type: 'card'
      },
    }
    
    //const response = await createAPayment(paymentData);

            /*
        response structure
        data = {
          "id": "c82f14b8-77be-4919-82f5-6b4b04613dba",
          "type": "payment",
          "merchantId": "fd8417cb-34c0-4a56-9d52-d4245c02cd38", // paid for 
          "merchantWalletId": "1000032538",
          "source": {
            "id": "587dcee0-7a03-4900-9c08-bd81d6e98f69",
            "type": "card"
          },
          "description": "Merchant Payment",
          "amount": {
            "amount": "1.00",
            "currency": "USD"
          },
          "status": "pending",
          "refunds": [],
          "createDate": "2020-10-04T11:26:37.796Z",
          "updateDate": "2020-10-04T11:26:37.796Z",
          "metadata": {
            "phoneNumber": "+19176263819",
            "email": "moore@daostack.io"
          }
        }
        ===
        @Qs:
        add payment response to 'payments' attribute in cards
        have a payment collection?
        await updateCard(cardId, response)
         */

}
