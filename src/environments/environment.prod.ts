// Enums
import { EnvName } from '@enums/environment.enum';

// Packages
import packageInfo from '../../package.json';

const scheme = 'http://';
const host   = 'localhost';
const port   = ':5000';
const path   = '/api/';

const baseUrl = scheme + host + port + path;

export const environment = {
  production      : true,
  version         : packageInfo.version,
  appName         : 'Edo Talent Hunt',
  envName         : EnvName.PROD,
  defaultLanguage : 'en',
  apiBaseUrl      : baseUrl,
  credoApiKey: '0PUB0024x8k5w4TU1dq570Jb8zJn0dLH'
};
