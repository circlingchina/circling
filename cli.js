// This file serves as an ad-hoc runner for testing stuff once or twice (i.e API calls)
const util = require("util");
const AirtableApi = require("./src/airtable/api.js");

const createUser = util.promisify(AirtableApi.createUser);

async function run() {
  const records = await createUser("test@test.com", "Test User");
  console.info("return", records);
}

run();
