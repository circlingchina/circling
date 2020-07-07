/**
 * The version of API calls that requires a self hosted API server (implemented in /src/server).
 * All calls go from client to Circling-Server first. The client holds a single access token (userId for now), everything else is stored server-side.
*/


// endpoint /api/events/:event_id/join?user_id=user_id
exports.joinEvent = async (event, user_id) => {
  const route = `${process.env.API_HOST}/events/${event.id}/join?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};

// endpoint /api/events/:event_id/unjoin?user_id=user_id
exports.unjoinEvent = async (event, user_id) => {
  const route = `${process.env.API_HOST}/events/${event.id}/unjoin?user_id=${user_id}`;
  return fetch(route).then((res)=> res.json());
};

// endpoing /api/events/nextTrail
exports.getTrailEvent = async () => {
  const route = `${process.env.API_HOST}/events/nextTrail`;
  return fetch(route).then((res)=> res.json());
};

exports.getEvents = async () => {
  const route = `${process.env.API_HOST}/events`;
  const res = await fetch(route).then((res)=> res.json());
  return res.events;
};

exports.updateUser = async (userId, params) => {
  const route = `${process.env.API_HOST}/users/${userId}`;
  const res = await fetch(route, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  }).then(res=>res.json());

  return res;
};

exports.findUserByEmail = async(email) => {
  const route = `${process.env.API_HOST}/users/find?email=${email}`;
  return fetch(route).then(res=>res.json());
};

exports.createUser = async(userParam) => {
  const route = `${process.env.API_HOST}/users`;
  const response = await fetch(route, {
    method: 'POST',
    body: JSON.stringify(userParam)
  });
  console.log("server response", response);
  return response;
};

exports.getNewCharge = async(userId, chargeType) => {
  const route = `${process.env.API_HOST}/payment/charges`;
  const response = await fetch(route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      charge_type: chargeType,
    })
  });
  return response.json();
};
