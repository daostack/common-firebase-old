// @ts-ignore
import { getTemplatedEmail } from '@functions/email';

import admin from 'firebase-admin';
import { runTest } from '../helpers/runTest';

const functions = require('@functions');
const test = require('firebase-functions-test')();


const requestToJoinStubs = {
  name: 'Test Name',
  link: 'https://google.com',
  commonName: 'Test Common Name'
};

const requestToJoinPartialStubs = {
  name: 'Test Name'
};
//
// const mockQueryResponse = jest.fn();
//
// mockQueryResponse.mockResolvedValue([
//   {
//     id: 1
//   }
// ]);
//
// jest.mock('firebase-admin', () => ({
//   initializeApp: jest.fn(),
//   firestore: () => ({
//     collection: jest.fn(path => ({
//       where: jest.fn(queryString => ({
//         get: mockQueryResponse
//       }))
//     }))
//   })
// }));
//
// describe('Emails Sending', () => {
//   beforeAll(() => {
//     jest.mock('firebase-admin', () => (
//         {
//           initializeApp: jest.fn()
//         }
//       )
//     )
//
//     admin.initializeApp();
//   })
//
//
// });

runTest((funcs) => {
  it('should be successful with all stubs', () => {
    const templatedEmail = getTemplatedEmail('requestToJoinSubmitted', {
      emailStubs: requestToJoinStubs
    });

    expect(templatedEmail).not.toBe(null);
    expect(templatedEmail).not.toBe(undefined);
  });

  it('should produce the same email for the same stubs', () => {
    const templatedEmail = getTemplatedEmail('requestToJoinSubmitted', {
      emailStubs: requestToJoinStubs
    });

    expect(templatedEmail).toMatchSnapshot();
  });

  it('should throw on missing stub', () => {
    expect(() => {
      getTemplatedEmail('requestToJoinSubmitted', {
        emailStubs: requestToJoinPartialStubs
      })
    }).toThrow();
  });
})