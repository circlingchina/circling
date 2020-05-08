// Use common js as it might be imported in Node (netlify functions)
const pick = require('lodash/pick');
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
        fields: pick(fieldsObj, fieldList),
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

  getUserByEmail: async (email) => {
    // TODO: check when does the select call return an error
    let ret = null;

    if (!email) {
      return ret;
    }
    const users = await base.Users.select({
      maxRecords: 1,
      filterByFormula: `{email}="${email}"`
    }).firstPage();
    
    if (users.length === 0) {
      return ret;
    }

    ret = users[0];
    
    return ret;
  },

  getEvent: (id) => {
    return base.OpenEvents.find(id);
  },

  join: async (event, userId) => {
    const eventUsers = event.fields.Users ? event.fields.Users : [];
    if (eventUsers.includes(userId)) {
      return event; //already joined
    }

    if (event.fields.Attendees >= event.fields.MaxAttendees) {
      return Promise.reject(new Error('Event is full!'));
    }

    eventUsers.push(userId);


    // call api
    const params = [
      {
        id: event.id,
        fields: {
          Users: eventUsers,
        },
      },
    ];
    return base.OpenEvents.update(params);
  },

  unjoin: async (event, userId) => {
  
    //prepare eventUser Array
    let eventUsers = event.fields.Users ? event.fields.Users : [];
    const index = eventUsers.indexOf(userId);
    if (index < 0) {
      //user is not in this event
      return new Promise.reject(new Error('User is not joined!'));
    }
    eventUsers.splice(index, 1);

    const params = [
      {
        id: event.id,
        fields: {
          Users: eventUsers,
        },
      },
    ];
    return base.OpenEvents.update(params);
  },

  getAllEvents: () => {
    return new Promise((resolve, reject) => {
      let allEvents = [];
      base.OpenEvents.select({
        filterByFormula: `NOT({Category}='新人介绍课程')`,
        view: "Grid view",
        sort: [{field: "Time", direction: "asc"}]
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
