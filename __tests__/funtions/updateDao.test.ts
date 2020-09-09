import { runTest } from '@helpers/runTest';
const functions = require('@functions');


runTest((funcs) => {
  it('should fail sometimes', () => {
    console.log(funcs);

    expect(1).toBe(1);
  });
});
