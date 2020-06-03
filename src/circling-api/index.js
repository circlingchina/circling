/** 
 * The version of API calls that requires a self hosted API server (implemented in /src/server).
 * All calls go from client to Circling-Server first. The client holds a single access token (userId for now), everything else is stored server-side.
*/


// endpoint /api/events/:event_id/join?user_id=user_id
export const joinEvent = async (event, user_id) => {
  const route = `${process.env.API_HOST}/events/${event.id}/join?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};

// endpoint /api/events/:event_id/unjoin?user_id=user_id
export const unjoinEvent = async (event, user_id) => {
  const route = `${process.env.API_HOST}/events/${event.id}/unjoin?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};

export const getEvents = async () => {
  const route = `${process.env.API_HOST}/events`;
  const res = await fetch(route).then((res)=> res.json());
  return res.events;
};

export const updateUser = async (userId, params) => {
  const route = `${process.env.API_HOST}/users/${userId}`;
  const res = await fetch(route, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  return res;
};

module.exports = {
  getEvents,
  joinEvent,
  unjoinEvent,
  updateUser
};