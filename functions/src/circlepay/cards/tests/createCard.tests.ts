import { v4 } from 'uuid';
import firebaseFunctionsTests from 'firebase-functions-test';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mockers
import '../../../util/tests/helpers/mockers/getUserMocker';

import { circleApp, getTestAuthenticationToken } from '../../../util/tests/helpers';

import { ICircleCreateCardResponse } from '../../types';
import { IGetCircleCardResponse } from '../../client/getCardFromCircle';

import { createCardSuccessfulRequest, getCardSuccessfulCvvCheck } from './data/testCardCirlceResponses';
import { validCreateCardRequest } from './data/testCardRequests';

const circleMatcher = /.{1,}circle\.com\/.*/;

const test = firebaseFunctionsTests({
  projectId: 'common-tests'
});

describe('Card creation process', () => {
  afterAll(async () => {
    await test.cleanup();
  });

  it('should work', () => {
    expect(true).toBeTruthy();
  });

  it('should be healthy', async () => {
    const authToken = await getTestAuthenticationToken(v4());

    const response = await circleApp
      .get('/health')
      .set({
        Authorization: authToken
      });


    expect(response.status).toBe(200);
    expect(response.body.healthy).toBeTruthy();
  });

  describe('Card creation validation', () => {
    it('should have working mock ', async () => {
      const cardOwnerId = v4();
      const mock = new MockAdapter(axios);

      mock.onPost(new RegExp(circleMatcher.source + (/\/cards/).source))
        .reply<ICircleCreateCardResponse>(200, createCardSuccessfulRequest);

      mock.onGet(new RegExp(circleMatcher.source + (/\/cards/).source))
        .reply<IGetCircleCardResponse>(200, getCardSuccessfulCvvCheck);

      const response = await circleApp
        .post('/create-card')
        .send(validCreateCardRequest)
        .set({
          Authorization: getTestAuthenticationToken(cardOwnerId)
        });

      expect(response.status).toBe(200);

      console.log(response.body);
    });
  });
});