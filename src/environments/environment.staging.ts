// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Enums
import { EnvName } from '@enums/environment.enum';

// Packages
import packageInfo from '../../package.json';

const scheme = 'http://';
const host   = 'localhost';
const port   = ':5000';
const path   = '/api';

// const baseUrl = scheme + host + port + path;
const baseUrl = 'https://eth-project-backend-staging-1086159474664.europe-west1.run.app'

export const environment = {
  production      : false,
  version         : packageInfo.version,
  appName         : 'Edo Talent Hunt',
  envName         : EnvName.LOCAL,
  defaultLanguage : 'en',
  apiBaseUrl      : baseUrl,
  credoBaseUrl: 'https://api.credocentral.com',
  credoApiKey: '0PUB0024x8k5w4TU1dq570Jb8zJn0dLH',
  credoSecretKey: '1PRI7593uzp9r20eb4C2g4WhnUz1o5mkHHa1hE'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
