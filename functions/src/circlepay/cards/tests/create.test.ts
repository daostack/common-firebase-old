import axios from 'axios';
import axiosMocker from 'axios-mock-adapter';

// @ts-ignore
import { circleApp } from '../../../../../__tests__/helpers/supertests';
// @ts-ignore
import { getTestAuthToken } from '../../../../../__tests__/helpers/auth';
import { StatusCodes } from '../../../constants';
import { getUser } from '../../../users/database/getUser';
import { IUserEntity } from '../../../users/types';

// ----- Constants
const createPath = '/create-card'

// ----- Mocks

jest.mock('../../../users/database/getUser');

(getUser as jest.Mock).mockImplementation((userId: string) => ({
  id: userId,
  email: `${userId}@gmail.com`
}))

const mocker = new axiosMocker(axios, {
  onNoMatch: 'throwException'
});

mocker
  .onPost('https://api-sandbox.circle.com/v1/cards')
  .reply(({data, headers}) => {
    // We get the data raw (as string) so we need to parse it
    data = JSON.parse(data);

    console.log(data, data.hey === 'theree', data.hey);

    if (data.hey === 'theree') {
      return [500, {message: 'typo'}];
    }

    return [200, data, headers];
  });

// ------ Data

const validCardData = {
  billingDetails: {
    name: 'Test User',
    city: 'Sofia',
    country: 'Bulgaria',
    line1: 'Suhata Reka 2321',
    postalCode: '1517',
    district: 'Poduyane'
  },
  expMonth: new Date().getMonth(),
  expYear: new Date().getFullYear() + 3,
  metadata: {
    email: 'testuser@mail.test',
    ipAddress: '192.168.0.1'
  },
  keyId: 'somekey',
  encryptedData: 'someencrypteddata'
};

describe('Card', () => {
  it('should not allow unauthorized card creation', async () => {
    // Act
    const response = await circleApp
      .post(createPath);

    // Assert
    expect(response.status).toEqual(401);
  });

  it('should fail without data', async () => {
    // Setup
    const authToken = await getTestAuthToken('test-user');

    // Act
    const response = await circleApp
      .post(createPath)
      .set({
        Authorization: authToken
      });

    // Assert
    expect(response.status).toBe(StatusCodes.UnprocessableEntity);
  });

  it('should fail with invalid data', async () => {
    // Setup
    const authToken = await getTestAuthToken('test-user');
    const { billingDetails, ...invalidData } = validCardData;

    // Act
    const response = await circleApp
      .post(createPath)
      .send(invalidData)
      .set({
        Authorization: authToken
      });

    // Assert
    expect(response.status).toBe(StatusCodes.UnprocessableEntity);

    // @todo Check other properties
    //    and expect the validation failure reason
    //    to be the same for them
  });

  it('should be able to create card with valid data', async () => {
    // Setup
    const authToken = await getTestAuthToken('test-user');

    // Act
    const response = await circleApp
      .post(createPath)
      .send(validCardData)
      .set({
        Authorization: authToken
      });

    // Assert
    expect(response.status).toBe(StatusCodes.Ok);

    // @todo Expect to have card ID
    expect(response.body.circleCardId).not.toBe(null);
    // @todo Expect to have metadata?
  });


  it('should create two card entities for the same card if the request is from different users', async () => {
    // @todo
    expect(true).toBeTruthy();
  });


  it('should fail the second card creation request for the same card from the same user', async () => {
    // @todo
    expect(true).toBeTruthy();
  });

  it('should allow one user to create more than one card', async () => {
    // @todo
    expect(true).toBeTruthy();
  });
});