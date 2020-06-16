// example event
// {
//   "path": "Path parameter",
//   "httpMethod": "Incoming request's method name"
//   "headers": {Incoming request headers}
//   "queryStringParameters": {query string parameters }
//   "body": "A JSON string of the request payload."
//   "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
// }

// example body
// {
//   "event": "login|signup|validate",
//   "user": {
//     # an Identity user object
//   }
// }

const axios = require("axios");

const handler = async function (event, context, callback) {
  try {
    const data = JSON.parse(event.body);
    console.log({version: "1.2", data});
    const userParam = {
      email: data.user.email,
      name: data.user.user_metadata.full_name || data.user.email
    };

    // stick the airtable
    
    const response = await createUser(userParam);
    console.log({response});
    return callback(null, {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    });
  } catch (err) {
    console.log("error", err);
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(err)
    });
  }
};

const createUser = async(userParam) => {
  const route = `${process.env.API_HOST}/users`;
  // const route = `http://127.0.0.1:4567/users`; HACK localhost testing with netlify dev
  console.log({route});

  const response = await axios.post(route, userParam);
  return response;
};


exports.handler = handler;
