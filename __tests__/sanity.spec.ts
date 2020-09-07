import { runTest } from '@helpers/runTest';
import { getTemplatedEmail } from '@functions/email';
const functions = require('@functions');
import axios from "axios"
const { env } = require('@env');
const { arc } = require('../functions/settings')

const requestToJoinStubs = {
  name: 'Test Name',
  link: 'https://google.com',
  commonName: 'Test Common Name'
};

const requestToJoinPartialStubs = {
  name: 'Test Name'
};

runTest((funcs) => {
  it('check if we are using development settings', () => {
    expect(env.environment).toEqual("dev")
    expect(arc.graphqlHttpProvider).toEqual('http://127.0.0.1:8000/subgraphs/name/daostack')
  })
})