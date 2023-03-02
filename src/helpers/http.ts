import { GoogleAuth, IdTokenClient } from 'google-auth-library';
import { Gaxios } from 'gaxios';

const _auth = new GoogleAuth();
const _clientInstances: Map<string, Gaxios | IdTokenClient> = new Map();

/**
 * Creates and returns an authenticated HTTP client.
 * 
 * If the GOOGLE_AUTH_TOKEN environment variable is set it is used as the bearer token.
 * Otherwise, the google-auth-library is used to aquire a token.
 * 
 * It is recommended to only include a base URL rather than a full URL for these reasons:
 *   - Cloud functions REQUIRE this, auth will fail if extra path is included after the function name
 *   - More efficient caching - a client instance is re-used if the url is the same
 * 
 * @param url the target URL that requires authentication, a base URL (including cloud function name) is sufficient.
 * @returns a (potentially cached) http client that will send an Authorization header
 */
export async function httpClient(url: string): Promise<Gaxios | IdTokenClient> {
  let client = _clientInstances.get(url);
  if (!client) {
    if (process.env.GOOGLE_AUTH_TOKEN) {
      client = new Gaxios({
        headers: {
          authorization: `Bearer ${process.env.GOOGLE_AUTH_TOKEN}`
        }
      });
    } else {
      client = await _auth.getIdTokenClient(url);
    }
    _clientInstances.set(url, client);
  }
  return client;
}
