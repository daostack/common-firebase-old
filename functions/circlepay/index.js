const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const circlepay = express();
const { env } = require('@env');
const cors = require('cors');
const {createCirclePayCard} = require('./createCirclePayCard'); 
const { responseExecutor } = require('../util/responseExecutor');

const config = {
	headers: { Authorization: `Bearer ${env.circlepay.apiKey}` }
}

const runtimeOptions = {
  timeoutSeconds: 540, // Maximum time 9 mins
};

circlepay.use(bodyParser.json()); // to support JSON-encoded bodies
circlepay.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
circlepay.use(express.json()); // to support JSON-encoded bodies
circlepay.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
circlepay.use(cors({ origin: true }));

circlepay.post('/create-card', async (req, res) => {
	console.log('index /create-card');
	responseExecutor(
		async () => {
			return await createCirclePayCard(req);
		},
		{
			req,
			res,
			successMessage: `CirclePay card created!`,
			errorMessage: `Unable to create CirclePay card!`
		})
});

exports.circlepay = functions.runWith(runtimeOptions).https.onRequest(circlepay);




