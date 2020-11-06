const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';

async function getPayout() {
    const data = await db.collection(COLLECTION_NAME).get();
    return data.docs.map(doc => doc.data())

}
module.exports = {
    getPayout
}