import express from 'express';

import { getArc } from '../settings';
import { StatusCodes } from './constants';
import { CommonError, ICommonError } from './errors/CommonError';

interface IResponseExecutorAction {
  (): any;
}

interface IResponseExecutorPayload {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
  successMessage: string;
}

interface IResponseExecutor {
  (action: IResponseExecutorAction, payload: IResponseExecutorPayload): Promise<void>
}

export const responseExecutor: IResponseExecutor = async (action, { req, res, next, successMessage }): Promise<void> => {
  try {
    let actionResult = await action();

    console.log(`ActionResult --> ${actionResult}`);

    if (!actionResult) {
      actionResult = {};
    }

    res
      .status(StatusCodes.Ok)
      .json({
        message: successMessage,
        ...actionResult
      });
  } catch (e) {
    next(e);
  }
};

interface IResponseCreateExecutor {
  (action: IResponseExecutorAction, payload: IResponseExecutorPayload, retried?: boolean): Promise<void>
}

export const responseCreateExecutor: IResponseCreateExecutor = async (action, { req, res, next, successMessage }, retried = false): Promise<void> => {
  const arc = await getArc();

  try {
    let actionResult = await action();

    console.log(actionResult);

    if (!actionResult) {
      actionResult = {};
    }

    res
      .status(StatusCodes.Ok)
      .json({
        message: successMessage,
        ...actionResult
      });
  } catch (e) {
    if (e.message.match('^No contract with address') && !retried) {

      // @todo Type the arc if possible
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await arc.fetchAllContracts(false);

      console.log('<--- No contract with address error, updating new arc --->');

      await responseCreateExecutor(action, {
        req,
        res,
        next,
        successMessage
      }, true);

      return;
    }

    next(e);
  }
};