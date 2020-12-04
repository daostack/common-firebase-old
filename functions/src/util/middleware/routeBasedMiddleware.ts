import express from 'express';
import { CommonError } from '../errors';

interface IRouteBasedMiddlewareOptions {
  /**
   * Only those routes will have the passed middleware
   */
  include?: string[],

  /**
   * Only those routes will not have the passed middleware
   */
  exclude?: string[]
}

export const routeBasedMiddleware = (middleware: express.RequestHandler, options: IRouteBasedMiddlewareOptions): express.RequestHandler =>
  (req, res, next) => {
    if (options.include?.length) {
      if (options.include.some(x => x === req.path)) {
        return middleware(req, res, next);
      } else {
        return next();
      }
    }

    if (options.exclude?.length) {
      if (options.exclude.some(x => x === req.path)) {
        return next();
      } else {
        return middleware(req, res, next);
      }
    }

    return next();
  };