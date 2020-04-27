/**
 * Client-side API Endpoint for circling server (implemented in /server directory of the mono-repo)
 */

// endpoint /api/events/:event_id/join?user_id=user_id
export const joinEvent = async (event_id, user_id) => {
  const route = `${process.env.API_HOST}:${process.env.API_PORT}/api/events/${event_id}/join?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};