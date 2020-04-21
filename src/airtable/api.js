import _ from 'lodash';
import { Users, OpenEvents } from './base';

// Promisify the AirTable api so the caller don't have to
// follow the callback style.

export default {
  createUser: (email, name, cb) => {

    Users.create(
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

      Users.update([
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
      Users.select({
        maxRecords: 1,
        filterByFormula: `{email}="${email}"`
      }).eachPage(function page(records, fetchNextPage) {
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
      OpenEvents.find(id, (err, record) => {
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

      eventUsers.push(airbaseUserId);

      // call api
      OpenEvents.update([
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
          console.log("records", records);
          resolve(records[0]);
        }
      });
    });
  },

  unjoin: (event, userId) => {
    return new Promise((resolve, reject) => {
      //prepare eventUser Array
      let eventUsers = event.fields.Users ? event.fields.Users : [];
      const index = eventUsers.indexOf(airbaseUserId);
      if (index < 0) {
        //user is not in this event
        resolve();
      }
      eventUsers.splice(index, 1);

      OpenEvents.update([
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
            console.log("records", records);
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
      OpenEvents.select({
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
