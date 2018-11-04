
const AWS = require('aws-sdk');
const axios = require('axios');

/* Config.
 * For the curious ones: These config variables are not some
 * magical values that appear from thin air. Each MIC instance
 * has a "manifest", which is a JSON object containing non-static
 * service configurations. In a real-world case the application
 * would either load the manifest at launch or save it locally
 * for later usage.
 *
 * The static endpoint for retrieving a MIC manifest is:
 *
 *   https://1u31fuekv5.execute-api.eu-west-1.amazonaws.com/prod/manifest/?hostname=<MIC hostname>
 *
 * E.g. for Start IoT:
 *
 *   https://1u31fuekv5.execute-api.eu-west-1.amazonaws.com/prod/manifest/?hostname=startiot.mic.telenorconnexion.com&
 */
const STACK_HOST = 'startiot.mic.telenorconnexion.com';

export default class API {
  constructor (API_KEY) {
    this.API_KEY = API_KEY
  }

  async init () {
    try {
      this.manifest = await this.fetchManifest();

      // Create an Axios instance
      this.api = axios.create({
        baseURL: `${this.manifest.ApiGatewayRootUrl}/prod`,
        headers: {
          // Attach required 'x-api-key' header with every request
          'x-api-key': this.API_KEY
        }
      });
      this.credentials = null;
      this.AWS = AWS;
    } catch (e) {
      throw e;
    }
  }

  async fetchManifest () {
    try {
      const { data } = await axios.get(`https://1u31fuekv5.execute-api.eu-west-1.amazonaws.com/prod/manifest/?hostname=${STACK_HOST}`);
      return data;
    } catch (e) {
      throw e;
    }
  }

  async login ({ username, password }) {
    try {
      let response = await this.api({
        method: 'post',
        url: '/auth/login',
        data: {
          userName: username,
          password: password
        }
      });
      this.credentials = response.data.credentials;

      // Add credentials headers for consecutive API calls
      this.api.defaults.headers.common['Authorization'] = this.credentials.token;
      this.api.defaults.headers.common['identityId'] = this.credentials.identityId;

      return true;
    } catch (e) {
      throw e;
    }
  }

  async createCognitoIdentity (token) {
    try {
      this.AWS.config.region = this.manifest.Region
      this.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.manifest.IdentityPool,
        Logins: {
          [`cognito-idp.${this.manifest.Region}.amazonaws.com/${this.manifest.UserPool}`]: token
        }
      })
      await this.AWS.config.credentials.getPromise()

      return this.AWS.config.credentials
    } catch (e) {
      throw e;
    }
  }

  logout () {
    // Clear credentials and headers
    this.credentials = null;
    this.api.defaults.headers.common['Authorization'] = null;
    this.api.defaults.headers.common['identityId'] = null;
  }

  async invoke (options) {
    try {
      // Pipe options to the Axios instance
      return await this.api(options);
    } catch (e) {
      // TODO: refresh token if expired and retry
      throw e;
    }
  }
}
