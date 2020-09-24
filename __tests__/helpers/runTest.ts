import functions from '@functions';

import { FeaturesList } from 'firebase-functions-test/lib/features';


const test = require("firebase-functions-test")({
  projectId: "common-tests",
  auth: {
    uid: "alice",
    email: "alice@example.com"
  }
});

export const runTest = (testsFunc: (functions: any , test: FeaturesList) => any): void => {
  describe('Cloud Functions', () => {
    afterAll(async () => {
      // Do other cleanup tasks.
      await test.cleanup();
    });

    testsFunc(functions, test);
  });
}