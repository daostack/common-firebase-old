const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./_keys/adminsdk-keys.json')),
  databaseURL: "https://common-daostack.firebaseio.com",  // TODO: move to ./settings.js
});

exports.relayer = require('./relayer');
exports.notification = require('./notification');
exports.graphql = require('./graphql');
