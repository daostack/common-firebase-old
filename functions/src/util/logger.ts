type severity = 'log' | 'info' | 'warn' | 'error';
type logFn = (message: string, ...args: any) => void;

export const logger: { [key in severity]: logFn } = {
  log: (message, args) => {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  },
  info: (...args: any): void => {
    // eslint-disable-next-line no-console
    console.info(...args);
  },
  warn: (...args: any): void => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  error: (...args: any): void => {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};