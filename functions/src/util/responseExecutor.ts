import express from 'express';

import { getArc } from '../settings';
import { StatusCodes } from './constants';
import { ICommonError } from './errors/CommonError';

interface IErrorResponse {
  error: string;
  errorId?: string;
  errorCode?: string;
  errorMessage?: string;
  request?: express.Request;
  data?: any;
}

const createErrorResponse = (res: express.Response, req: express.Request, error: ICommonError): void => {
  const errorResponse: IErrorResponse = {
    error: error.message,
    errorId: error.errorId,
    errorCode: error.errorCode || `${error.statusCode}`,
    errorMessage: error.userMessage,
    // The request object causes circular structure error. Maybe only some fields of it?
    // request: req,
    data: error.data
  };

  const statusCode =
    error.statusCode ||
    StatusCodes.InternalServerError;

  console.error(
    `Creating error response with message '${error.message}' for error (${error.errorId || 'No id available'})`,
    errorResponse,
    error
  );

  console.log(statusCode);

  res
    .status(statusCode)
    .send(errorResponse);
};

interface IResponseExecutorAction {
  (): any;
}

interface IResponseExecutorPayload {
  req: express.Request;
  res: express.Response;
  successMessage: string;
  errorMessage: string;
}

interface IResponseExecutor {
  (action: IResponseExecutorAction, payload: IResponseExecutorPayload): Promise<void>
}

export const responseExecutor: IResponseExecutor = async (action, { req, res, successMessage, errorMessage }): Promise<void> => {
  try {
    let actionResult = await action();
    console.log(`ActionResult --> ${actionResult}`);
    if (!actionResult) {
      actionResult = {};
    }
    res.status(StatusCodes.Ok)
      .json({
        message: successMessage,
        ...actionResult
      });
  } catch (e) {
    createErrorResponse(res, req, e);
  }
};

interface IResponseCreateExecutor {
  (action: IResponseExecutorAction, payload: IResponseExecutorPayload, retried: boolean): Promise<void>
}

export const responseCreateExecutor: IResponseCreateExecutor = async (action, { req, res, successMessage, errorMessage }, retried = false): Promise<void> => {
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
        successMessage,
        errorMessage
      }, true);

      return;
    }

    createErrorResponse(res, req, e);
  }
};