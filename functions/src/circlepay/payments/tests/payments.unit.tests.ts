import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  getPaymentFailedResponse,
  getPaymentPendingResponce,
  getPaymentSuccessfulResponce
} from './data/testCircleResponses';
import { ICirclePayment } from '../../types';
import '../../../util/tests/helpers/mockers/payments/updatePayment.mocker';
import '../../../util/tests/helpers/mockers/firebase.mocker';

// Add the logger to the tests globals
import '../../../util/logger';

import { pendingPaymentEntity, successfulPaymentEntity } from './data/testPaymentEntities';
import { pollPayment } from '../business/pollPayment';

const circleMatcher = /.+circle\.com\/.*/;
const circePaymentEndpointMatcher = new RegExp(circleMatcher.source + (/\/payments/).source);

// ----- Local Mocks

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: jest.fn(() => ({
      withConverter: jest.fn()
        .mockImplementation(() => jest.fn())
      //
      // where: jest.fn(queryString => ({
      //   get: mockQueryResponse
      //
      // }))
    })),
    settings: jest.fn()
  })
}));

describe('Payment Unit Tests', () => {
  describe('Payment polling', () => {
    it('should poll until successful status is reached', async () => {
      // Arrange
      const mock = new MockAdapter(axios);
      const mockSpy = jest.spyOn(axios, 'get');


      // On the initial 10 calls return pending
      for (let i = 0; i < 10; i++) {
        mock
          .onGet(circePaymentEndpointMatcher)
          .replyOnce<ICirclePayment>(200, getPaymentPendingResponce);
      }

      // On the 11th and all sequential calls return check success
      mock
        .onGet(circePaymentEndpointMatcher)
        .reply<ICirclePayment>(200, getPaymentSuccessfulResponce);

      // Act
      const pollResult = await pollPayment(successfulPaymentEntity, {
        interval: 0
      });

      // Assert
      expect(pollResult).toMatchSnapshot();
      expect(mockSpy).toHaveBeenCalledTimes(11);

      // Cleanup
      mock.restore();
      mockSpy.mockClear();
    });

    it('should poll until failed status is reached', async () => {
      // Arrange
      const mock = new MockAdapter(axios);
      const mockSpy = jest.spyOn(axios, 'get');


      // On the initial 10 calls return pending
      for (let i = 0; i < 10; i++) {
        mock
          .onGet(circePaymentEndpointMatcher)
          .replyOnce<ICirclePayment>(200, getPaymentPendingResponce);
      }

      // On the 11th and all sequential calls return check success
      mock
        .onGet(circePaymentEndpointMatcher)
        .reply<ICirclePayment>(200, getPaymentFailedResponse);

      // Act
      const pollResult = await pollPayment(pendingPaymentEntity, {
        interval: 0
      });

      // Assert
      expect(pollResult).toMatchSnapshot();
      expect(mockSpy).toHaveBeenCalledTimes(11);

      // Cleanup
      mock.restore();
      mockSpy.mockClear();
    });

    it('should throw if failed status is reached and throw was requested', async () => {
      // Arrange
      const mock = new MockAdapter(axios);
      const mockSpy = jest.spyOn(axios, 'get');

      mock
        .onGet(circePaymentEndpointMatcher)
        .reply<ICirclePayment>(200, getPaymentFailedResponse);

      // Act and Assert
      await expect(pollPayment(pendingPaymentEntity, {
        interval: 0,
        throwOnPaymentFailed: true
      }))
        .rejects
        .toThrowError('Payment failed');

      // Cleanup
      mock.restore();
      mockSpy.mockClear();
    });

    it('should throw if the maximum poll attempts are reached', async () => {
      // Arrange
      const mock = new MockAdapter(axios);
      const mockSpy = jest.spyOn(axios, 'get');

      // Only pending responses
      mock
        .onGet(circePaymentEndpointMatcher)
        .reply<ICirclePayment>(200, getPaymentPendingResponce);

      // Act and assert
      await expect(pollPayment(pendingPaymentEntity, {
        interval: 0
      }))
        .rejects
        .toThrowError('Max polling attempts reached!');

      // Cleanup
      mock.restore();
      mockSpy.mockClear();
    });
  });

  // describe('General payments', () => {
  //
  // });
  //
  // describe('One-time payments', () => {
  //
  // });
  //
  // describe('Subscription payments', () => {
  //
  // });
});