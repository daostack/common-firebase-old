import { v4 as uuidv4 } from 'uuid';


interface IErrorData {
  statusCode?: number;
  errorCode?: string;

  payload?: any;

  [key: string]: any;
}

class CommonError extends Error {
  public errorId: string;
  public errorCode: string;
  public userMessage: string;
  public statusCode: number;
  public data: any;


  /**
   * Create new common error
   *
   * @param message - the error message (required)
   * @param userMessage - the error message that the user will see (optional)
   * @param data - more data, related to the error (optional)
   */
  constructor(
    message: string,
    userMessage = 'Something bad happened',
    data: IErrorData = {}
  ) {
    super(message);

    this.errorId = uuidv4();
    this.name = this.constructor.name;

    this.userMessage = userMessage;

    this.statusCode = data.statusCode;
    this.errorCode = data.errorCode;
    this.data = data.payload;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CommonError;