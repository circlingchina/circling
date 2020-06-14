require("dotenv").config();
const db = require('./index');

async function logNumEvents() {
  const results = await db("events").select("name").limit(5);
  console.info({results});
}

(async ()=> {
  await logNumEvents();
  db.destroy();
})();