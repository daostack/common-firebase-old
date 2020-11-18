export const getTestAuthToken = (userId = 'test-user') => JSON.stringify({
  uid: userId
});