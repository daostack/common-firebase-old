const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const circlepay = express();
const { env } = require('@env');
const cors = require('cors');
const {createCirclePayCard} = require('./createCirclePayCard'); 
const { responseExecutor } = require('../util/responseExecutor');
const {encryption} = require('./circlepay');

const runtimeOptions = {
  timeoutSeconds: 540,
};

circlepay.use(bodyParser.json());
circlepay.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
circlepay.use(express.json()); // to support JSON-encoded bodies
circlepay.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
circlepay.use(cors({ origin: true }));

circlepay.post('/create-card', async (req, res) => {
	console.log('index /create-card');
	responseExecutor(
		async () => (await createCirclePayCard(req)),
		{
			req,
			res,
			successMessage: `CirclePay card created!`,
			errorMessage: `Unable to create CirclePay card!`
		})
});

circlepay.get('/encryption', async (req, res) => {
	console.log('index/encryption');
	responseExecutor(
	async () => (await encryption()), // create a file for this?
	{
		req,
		res,
		successMessage: `PCI encryption key generated!`,
		errorMessage: `Unable to generate PCI encryption key!`
	})
})

exports.circlepay = functions.runWith(runtimeOptions).https.onRequest(circlepay);
