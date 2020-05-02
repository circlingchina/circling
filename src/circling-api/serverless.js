/** 
 * The serverless version of API calls. A thin wrapper around AirtableApi, to make this and the serverful version have identical function signatures. 
 * Calls go directly from the client to end-points(i.e Airtable). Using this version of the API requires the client to hold access tokens. 
 * The goal is to pick either serverless or serverful version and delete the other one moving forward.
*/
import AirtableApi from '../airtable/api';

export const joinEvent = async (event, user_id) => {
  return AirtableApi.join(event, user_id);
};

export const unjoinEvent = async (event, user_id) => {
  return AirtableApi.unjoin(event, user_id);
};