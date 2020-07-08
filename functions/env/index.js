const envSecrets = require('./env/env_secrets.json');
const envConfig = require('./env/env_config.json');

const env = {...envConfig, ...envSecrets};

exports.env = env;
