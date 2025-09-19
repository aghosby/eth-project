// Enums
import { EnvName } from '@enums/environment.enum';

// Packages
import packageInfo from '../../package.json';

const scheme = 'http://';
const host   = 'localhost';
const port   = ':5000';
const path   = '/api/';

// const baseUrl = scheme + host + port + path;
const baseUrl = 'https://eth-project-backend-1086159474664.europe-west1.run.app/api/v1'


export const environment = {
  production      : true,
  version         : packageInfo.version,
  appName         : 'Edo Talent Hunt',
  envName         : EnvName.PROD,
  defaultLanguage : 'en',
  apiBaseUrl      : baseUrl,
  credoApiKey: '1PUB7593p0OB2Gy7ZHc6rmCtEf8M903b4A1HeE'
};
