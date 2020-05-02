/** 
 * The version of API calls that requires a self hosted API server (implemented in /src/server).
 * All calls go from client to Circling-Server first. The client holds a single access token (userId for now), everything else is stored server-side.
*/


// endpoint /api/events/:event_id/join?user_id=user_id
export const joinEvent = async (event_id, user_id) => {
  const route = `${process.env.API_HOST}:${process.env.API_PORT}/api/events/${event_id}/join?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};

// endpoint /api/events/:event_id/unjoin?user_id=user_id
export const unjoinEvent = async (event_id, user_id) => {
  const route = `${process.env.API_HOST}:${process.env.API_PORT}/api/events/${event_id}/unjoin?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};