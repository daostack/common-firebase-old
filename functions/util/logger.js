const { env } = require('../env');

const log = (logLevel, ...args) => {
  if (env.logLevel >= logLevel) {
    console.log(...args);
  }
};

exports.trace = (...args) =>
  log(5, '[Trace]', ...args);

exports.debug = (...args) =>
  log(4, '[Debug]', ...args);

exports.info = (...args) =>
  log(3, '[Info]', ...args);

exports.warning = (...args) =>
  log(2, '[Warning]', ...args);

exports.error = (...args) =>
  log(1, '[Error]', ...args);
