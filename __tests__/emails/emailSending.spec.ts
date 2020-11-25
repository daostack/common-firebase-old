import { getTemplatedEmail } from '../../functions/src/notification/email';

const requestToJoinStubs = {
  userName: 'Test Name',
  link: 'https://google.com',
  commonName: 'Test Common Name'
};

const requestToJoinPartialStubs = {
  userName: 'Test Name'
};

describe('The email sending', () => {
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
      });
    }).toThrow();
  });
});