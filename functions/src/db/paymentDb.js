const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';

const updatePayment = async (paymentId, doc) => (
  await db.collection(COLLECTION_NAME)
    .doc(paymentId)
    .set(
        doc,
        {
            merge: true
        }
    )
)

module.exports = {
    updatePayment
};