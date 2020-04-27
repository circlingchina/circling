// Use common js as it might be imported in Node (netlify functions)
const _ = require('lodash');
const base = require('./base.js');

// Promisify the AirTable api so the caller don't have to
// follow the callback style.

module.exports = {
  createUser: (email, name, cb) => {
    base.Users.create(
      [
        {
          fields: {
            email: email,
            Name: name,
          },
        },
      ],
      cb
    );
  },

  updateUser: (id, fieldsObj) => {
    return new Promise((resolve, reject) => {
      // fields white list
      const fieldList = ['Name', 'WechatUserName', 'email'];
      const userObjToUpdate = {
        id,
        fields: _.pick(fieldsObj, fieldList),
      };

      base.Users.update([
        userObjToUpdate
      ], (err, records) => {
        if (err) {
          reject(err);
        }
        resolve(records[0]);
      });
    });
  },

  getUserByEmail: (email) => {
    // TODO: check when does the select call return an error
    return new Promise((resolve, reject) => {
      if (!email) {
        resolve();
      }
      base.Users.select({
        maxRecords: 1,
        filterByFormula: `{email}="${email}"`
      }).eachPage((records, fetchNextPage) => {
        if (records.length == 0) {
          resolve();
        }
        resolve(records[0]);
      });
    });
  },

  getEvent: (id) => {
    return new Promise((resolve, reject) => {
      if (!id) {
        resolve();
      }
      base.OpenEvents.find(id, (err, record) => {
        if (err) {
          reject(err);
        }
        resolve(record);
      });
    });
  },

  join: (event, userId) => {
    return new Promise((resolve, reject) => {
      //prepare eventUsers array
      const eventUsers = event.fields.Users ? event.fields.Users : [];
      if (eventUsers.includes(userId)) {
        resolve(event); //already joined
      }

      if (event.fields.Attendees >= event.fields.MaxAttendees) {
        reject('MaxAttendees limit!');
      }

      eventUsers.push(userId);

      // call api
      base.OpenEvents.update([
        {
          id: event.id,
          fields: {
            Users: eventUsers,
          },
        },
      ], (err, records) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(records[0]);
        }
      });
    });
  },

  unjoin: (event, userId) => {
    return new Promise((resolve, reject) => {
      //prepare eventUser Array
      let eventUsers = event.fields.Users ? event.fields.Users : [];
      const index = eventUsers.indexOf(userId);
      if (index < 0) {
        //user is not in this event
        resolve();
      }
      eventUsers.splice(index, 1);

      base.OpenEvents.update([
        {
          id: event.id,
          fields: {
            Users: eventUsers,
          },
        },
      ],
      (err, records) => {
        if (err) {
          reject(err);
        } else {
          resolve(records[0]);
        }
      }
      );
    });
  },

  getAllEvents: () => {
    return new Promise((resolve, reject) => {
      let allEvents = [];
      const CATEGORY = '每日Circling';
      base.OpenEvents.select({
        filterByFormula: `{Category}="${CATEGORY}"`,
        view: "Grid view",
      }).eachPage((records, fetchNextPage) => {
        allEvents = allEvents.concat(records);
        fetchNextPage();
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(allEvents);
        }
      });
    });
  },
};
