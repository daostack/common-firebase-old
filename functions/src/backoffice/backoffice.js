const { db } = require('../settings.js');
const COLLECTION_NAME = 'payments';

const getPayout = async () => {
    const data = await db.collection(COLLECTION_NAME).get();
    return data

}
module.exports = {
    getPayout
}