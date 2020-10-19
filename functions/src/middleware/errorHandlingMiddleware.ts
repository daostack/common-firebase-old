import express from 'express';

import { CommonError } from '../util/errors';
import { ErrorCodes, StatusCodes } from '../util/constants';

export const errorHandling = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
  res.status(StatusCodes.InternalServerError);

  if (err instanceof CommonError) {
    if(err.statusCode) {
      res.status(err.statusCode);
    }

    throw (err);
  }

  console.error('Error that is not CommonError occurred', err);

  throw new CommonError(err.message, null, {
    errorCode: ErrorCodes.UncaughtError,
    payload: JSON.stringify(err)
  });
};