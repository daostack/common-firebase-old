const admin = require('firebase-admin');
const db = admin.firestore();

const {Collections} = require('../util/constants');

async function createEvent(doc) {
    return await db.collection(Collections.Event).add(doc);
}

module.exports = {
    createEvent
};
