// This file serves as an ad-hoc runner for testing stuff once or twice (i.e API calls)
const util = require("util");
require("dotenv").config();
const AirtableApi = require("./src/airtable_api");

const createUser = util.promisify(AirtableApi.createUser);

async function run() {
  const records = await createUser("test@test.com", "Test User");
  console.log("return", records);
}

run();
