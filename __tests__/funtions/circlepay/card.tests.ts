import axios from 'axios';
import axiosMocker from 'axios-mock-adapter';

import { circleApp } from '../../helpers/supertests';

const mocker = new axiosMocker(axios, {
  onNoMatch: 'throwException'
});

mocker
  .onPost('https://api-sandbox.circle.com/v1/cards')
  .reply(({ data, headers }) => {
    // We get the data raw (as string) so we need to parse it
    data = JSON.parse(data);

    console.log(data, data.hey === 'theree', data.hey);

    if (data.hey === 'theree') {
      return [500, { message: 'typo' }]
    }

    return [200, data, headers];
  });

describe('Card', () => {
  it('should not allow unauthorized card creation', async () => {
    // Act
    const response = await circleApp
      .post('/create-card');

    // Assert
    expect(response.status).toEqual(401);
  });

  it('should fail without data', async () => {
    // @todo
    expect(true).toBeTruthy();
  })

  it('should fail with invalid data', async () => {
    // @todo
    expect(true).toBeTruthy();
  })

  it('should be able to create card with valid data', async () =>{
    // @todo
    expect(true).toBeTruthy();
  })


  it('should create two card entities for the same card if the request is from different users', async () =>{
    // @todo
    expect(true).toBeTruthy();
  })


  it('should fail the second card creation request for the same card from the same user', async () =>{
    // @todo
    expect(true).toBeTruthy();
  })

  it('should allow one user to create more than one card', async () => {
    // @todo
    expect(true).toBeTruthy();
  })
});