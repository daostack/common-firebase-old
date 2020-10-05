import { env } from '@env';
import {createCirclePayCard} from './createCirclePayCard';
import { createPayment } from './createPayment';
import { createFundingProposal } from  './createFundingProposal';
import { encryption } from './circlepay';
const functions = require('firebase-functions');
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { responseExecutor } from '../util/responseExecutor';
export const circlepay = express();

const runtimeOptions = {
  timeoutSeconds: 540,
};

circlepay.set('trust proxy',true); 
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
	async () => (await encryption()),
	{
		req,
		res,
		successMessage: `PCI encryption key generated!`,
		errorMessage: `Unable to generate PCI encryption key!`
	})
})

circlepay.post('/create-a-payment', async (req, res) => {
	console.log('index/create-a-payment');
	responseExecutor(
	async () => (await createPayment(req.body)),
	{
		req,
		res,
		successMessage: `Payment was successful`,
		errorMessage: `Unable to process payment!`
	})
});

circlepay.post('/create-funding-proposal', async (req, res) => {
	console.log('index/create-funding-proposal');
	responseExecutor(
	async () => (await createFundingProposal(req)),
	{
		req,
		res,
		successMessage: `Funding proposal creation was successful`,
		errorMessage: `Unable to create funding proposal!`
	})
	return;
});



exports.circlepay = functions.runWith(runtimeOptions).https.onRequest(circlepay);
