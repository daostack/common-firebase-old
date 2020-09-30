// import supertest from 'supertest';
//
// import '@functions';
// import { runTest } from '@helpers/runTest';
//
// runTest((funcs, test) => {
//   const create = supertest(funcs.create);
//   const { auth } = test;
//
//   const daoId = '';
//   const idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNjYzOGY4NDlkODVhNWVkMGQ1M2NkNDI1MzE0Y2Q1MGYwYjY1YWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWxleGFuZGVyIEl2YW5vdiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHZ2FCeHJMRE9iLWY1TTFLQ1dtVjZ1MzlJXzhoWlFyM0ZHelN3RU1MWmM9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY29tbW9uLXN0YWdpbmctNTA3NDEiLCJhdWQiOiJjb21tb24tc3RhZ2luZy01MDc0MSIsImF1dGhfdGltZSI6MTYwMDg1NDM0NiwidXNlcl9pZCI6Ikg1WmtjS0JYNWVYWE55QmlQYXBoOEVIQ2lheDIiLCJzdWIiOiJINVprY0tCWDVlWFhOeUJpUGFwaDhFSENpYXgyIiwiaWF0IjoxNjAwODYxNTc4LCJleHAiOjE2MDA4NjUxNzgsImVtYWlsIjoiYWxleGFuZGVyMjAwMWl2YW5vdkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjEwNzk1NTE0Mjg2OTQxMTgyNTUwMSJdLCJlbWFpbCI6WyJhbGV4YW5kZXIyMDAxaXZhbm92QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.Rx6GzrRTiZ-JQjnEsSrLr-iwSsJ6d6uGSDdK8jshpSDRCH55_IXz8d1JINmRaR4fJ8fv_SgjKh1nN-HXKt3lJoJKkSNv2OwO0PqXHYafFwfsT1IywU3O6HUui0DwdjYYsLtlcFBQi2ubObohw9B7gW6vzzyQhFWkS4vWMHby86M48T74v_Oj5PhrmYCIdKtjaH6fkK_h4XX2XkDIW9cd9E2lklYwUNMeG9B2mc_dUfC_Z01QMskMHvArBS-haWbXjqXxlVOASN4xCvS6Yym-Kf4TUu_hzzsTX3jMx_uA75GPeuoC7ZUwKz-REsDpvc0llQ7VJwcZ9qq1o4ADZ30Mqw';
//   const data = {
//     title: `request to join ${daoId}`,
//     description: 'I\'m just testing the request to join so let me in',
//     links: [],
//     funding: 10 * 100,
//     preAuthId: false,
//   };
//
//   describe('Request to join creation', () => {
//     it('should be fail creating proposal transaction without all needed provided', async () => {
//       const res = await create.post('/createRequestToJoinTransaction');
//
//       expect(res.ok).toBeFalsy();
//       expect(res.status).toBe(500);
//
//       expect(res.body.error).not.toBe(null);
//       expect(res.body.error.commonMessage).toMatchSnapshot();
//     });
//
//     it('should successfully create common creation transaction with all the needed data present', async () => {
//       const res = await create
//         .post('/createRequestToJoinTransaction')
//         .send({
//           idToken,
//           data,
//           daoId,
//           user: auth.exampleUserRecord()
//         });
//
//
//       expect(res.status).toBe(200);
//
//       expect(res.body.message).toMatchSnapshot();
//     });
//   });
// });
//

it('test needed so I don\'t have to delete the file', () => {
  expect(true).toBeTruthy();
})
