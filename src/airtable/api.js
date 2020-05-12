// Use common js as it might be imported in Node (netlify functions)
const pick = require('lodash/pick');
const base = require('./base.js');

// Promisify the AirTable api so the caller don't have to
// follow the callback style.

function recordIdsFilterFormular(recordIds) {
  return 'OR(' + recordIds.map(e => `RECORD_ID()="${e}"`) + ')';
}

function getAllEvents() {
  return new Promise((resolve, reject) => {
    let allEvents = [];
    base.OpenEvents.select({
      filterByFormula: `NOT({Category}='新人介绍课程')`,
      view: "Grid view",
      sort: [{field: "Time", direction: "asc"}]
    }).eachPage((records, fetchNextPage) => {
      // Fix the link record issue from Airtable
      records.forEach(r => {
        r.fields.Users = r.fields.Users || [];
      });

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
}

function getUsersByIds(userIds, fields) {
  return new Promise((resolve, reject) => {
    let allUsers = [];

    const params = {
      filterByFormula: recordIdsFilterFormular(userIds)
    };
    if (fields) {
      params.fields = fields;
    }

    base.Users.select(
      params
    ).eachPage((records, fetchNextPage) => {
      allUsers = allUsers.concat(records);
      fetchNextPage();
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(allUsers);
      }
    });
  });
}

async function _addUserInfoIntoEvents(events) {
  const userIdSet = new Set();
  const userMap = new Map();

  events.forEach(e => {
    e.fields.Users = e.fields.Users || [];
    e.fields.Users.forEach(userIdSet.add, userIdSet);
  });

  let users = await getUsersByIds([...userIdSet], ['Name', '_recordId']);

  users.forEach(user => {
    userMap.set(user.id, user.fields.Name);
  });

  events.forEach(event => {
    event.fields.Users = event.fields.Users || [];
    event.fields.UsersExtra = event.fields.Users.map(userId => { 
      return {id: userId, 'Name': userMap.get(userId)};
    });
    event.fields.UsersDisplay = (event.fields.UsersExtra.map(e => e.Name)).join(', ');
  });

  return events;
}

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
    const records = await base.OpenEvents.update(params);
    
    return await _addUserInfoIntoEvents(records);
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
    const records = await base.OpenEvents.update(params);

    return await _addUserInfoIntoEvents(records);
  },

  getAllEvents,

  getUsersByIds,

  getAllEventsWithUsers: async () => {
    let events = await getAllEvents();
    return await _addUserInfoIntoEvents(events);
  }
};
