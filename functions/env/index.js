const envSecrets = require('./env_secrets.json');
const envConfig = require('./env_config.json');

const env = {...envConfig, ...envSecrets};

exports.env = env;
