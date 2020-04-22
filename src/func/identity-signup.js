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

const AirtableApi = require("../airtable/api");
const util = require("util");

//call Airtable API synchronously inside lambda
const createUser = util.promisify(AirtableApi.createUser);

const handler = async function (event, context, callback) {
  try {
    const data = JSON.parse(event.body);
    console.log("v1.1", data);
    const { user } = data;

    // stick the airtable

    const records = await createUser(user.email, user.user_metadata.full_name);
    let responseBody = "success";
    if (records.length > 0) {
      responseBody = {
        user_metadata: {
          ...user.user_metadata, // append current user metadata
          airtable_id: records[0].id,
        },
      };
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(responseBody),
    });
  } catch (err) {
    console.log("error", err)
  }
};

exports.handler = handler;
