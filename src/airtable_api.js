var Airtable = require("airtable");
var _ = require("lodash");
var base = new Airtable({ apiKey: process.env.AIRBASE_API_KEY }).base(
  "app53ecZ2UL9M6JOw"
);

module.exports = {
  createUser: (email, name, cb) => {
    base("Users").create(
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

  updateUser: (id, fieldsObj, onSuccess, onError) => {
    // fields white list
    const fieldList = ['Name', 'WechatUserName', 'email'];
    const userObjToUpdate = {
      id,
      fields: _.pick(fieldsObj, fieldList),
    };

    base("Users").update([
      userObjToUpdate 
    ], (err, records) => {
      if (err) {
        onError(err);
        return;
      }
      onSuccess(records[0]);
    });
  },

  getEvent: (id, onSuccess, onError) => {
    if(!id) {
      return;
    }
    base('OpenEvents').find(id,(err, record)=> {
      if (err) {
        console.log(err); 
        return;
      }
      onSuccess(record);
    });
  },

  join: (event, userId, onSuccess, onError) => {
    //prepare eventUsers array
    const eventUsers = event.fields.Users ? event.fields.Users : [];
    if (eventUsers.includes(userId)) {
      return; //already joined
    }
    
    if (event.fields.Attendees >= event.fields.MaxAttendees) {
      onError('MaxAttendees limit!');
      return;
    }
    
    eventUsers.push(airbaseUserId);

    // call api
    base("OpenEvents").update(
      [
        {
          id: event.id,
          fields: {
            Users: eventUsers,
          },
        },
      ],
      (err, records) => {
        if (err) {
          onError(err);
        } else {
          console.log("records", records);
          onSuccess(records[0]);
        }
      }
    );
  },

  unjoin: (event, userId, onSuccess, onError) => {
    //prepare eventUser Array
    let eventUsers = event.fields.Users ? event.fields.Users : [];
    const index = eventUsers.indexOf(airbaseUserId);
    if (index < 0) {
      //user is not in this event
      return;
    }
    eventUsers.splice(index, 1);

    base("OpenEvents").update(
      [
        {
          id: event.id,
          fields: {
            Users: eventUsers,
          },
        },
      ],
      (err, records) => {
        if (err) {
          onError(err);
        } else {
          console.log("records", records);
          onSuccess(records[0]);
        }
      }
    );
  },

  getAllEvents: (onSuccess, onError) => {
    let allEvents = [];
    base("OpenEvents")
      .select({
        filterByFormula: '{Category} = \"每日Circling\"',
        view: "Grid view",
      })
      .eachPage(
        (records, fetchNextPage) => {
          // This function (`page`) will get called for each page of records.
          allEvents = allEvents.concat(records);

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        (err) => {
          if (err) {
            onError(err);
          } else {
            onSuccess(allEvents);
          }
        }
      );
  },
};
