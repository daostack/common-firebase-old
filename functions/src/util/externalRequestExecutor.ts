import { CommonError } from './errors';

interface IExternalErrorData {
  errorCode: string;

  message?: string;
  userMessage?: string;

  [key: string]: any;
}

export const externalRequestExecutor = async (func: () => any, data: IExternalErrorData): Promise<any> => {
  try {
    const result = await func();

    console.log('External request made successfully');

    return result;
  } catch (err) {
    console.error(err.toString(), err)
    // @todo Please also bulble up the original error to be handled later or shown to the user 
    throw new CommonError(
      data.message || `External service failed. ErrorCode: ${data.errorCode}`,
      data.userMessage || `A call to an external service failed. Please try again later`,
      {
        ...data
      }
    );
  }
};




