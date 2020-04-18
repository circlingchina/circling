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

const AirtableApi = require("../airtable_api");
const util = require("util");

//call Airtable API synchronously inside lambda
const createUser = util.promisify(AirtableApi.createUser);

const handler = async function (event, context, callback) {
  // const { identity, user } = context.clientContext;
  const identityEvent = event["body"]["event"];
  const user = event["body"]["user"];

  const records = await createUser(
    user.user_metadata.email,
    user.user_metadata.full_name
  );
  console.log("records", records);
  callback(null, {
    statusCode: 200,
    body: `Success`,
  });
};

exports.handler = handler;
