import Event from "../models/Event";

test('constructor validates json for required fields', () => {
  expect(() => new Event({})).toThrowError(new Error("event must have id"));
  expect(() => new Event({id: 5})).toThrowError(new Error("event must have fields"));
});

test('event isFull returns false when there are less users than MaxAttendee', () => {
  const event1 = new Event({
    id: "abc",
    fields: {
      MaxAttendees: 7,
      Users: [
        "user_id_1"
      ],
    }
  });
  expect(event1.isFull()).toBe(false);
});

test('event isFull returns true when there are less users than MaxAttendee', () => {
  const event1 = new Event({
    id: "abc",
    fields: {
      MaxAttendees: 1,
      Users: [
        "user_id_1"
      ],
    }
  });
  expect(event1.isFull()).toBe(true);
});

test('event isFull returns true when MaxAttendee is 0', () => {
  const event1 = new Event({
    id: "abc",
    fields: {
      MaxAttendees: 0,
      Users: [],
    }
  });
  expect(event1.isFull()).toBe(true);
});

test('event.containsUser() returns true if and only if user is in event', () => {
  const event1 = new Event({
    id: "abc",
    fields: {
      MaxAttendees: 0,
      Users: ["bob", "carl"],
    }
  });
  expect(event1.containsUser("alice")).toBe(false);
  expect(event1.containsUser("bob")).toBe(true);
  expect(event1.containsUser("carl")).toBe(true);
});

const minutesFromNow = (minutes) => {
  return new Date(new Date().getTime() + (minutes * 60 * 1000));
};

test('event.startingStatus() returns NOT_STARTED for events 2 hours into future', () => {
  const isoStr = minutesFromNow(300).toISOString();
  const event = new Event({
    id: "abc",
    fields: { Time: isoStr }
  });

  expect(event.startingStatus()).toBe(Event.Status.NOT_STARTED);
});


test('event.startingStatus() returns STARTING_SOON for events within 2 hours', () => {
  const isoStr = minutesFromNow(60).toISOString();
  const event = new Event({
    id: "abc",
    fields: { Time: isoStr }
  });

  expect(event.startingStatus()).toBe(Event.Status.STARTING_SOON);
});

test('event.startingStatus() returns ONGOING for events between 15 min to 2 hours running', () => {
  const isoStr = minutesFromNow(10).toISOString();
  const event = new Event({
    id: "abc",
    fields: { Time: isoStr }
  });
  expect(event.startingStatus()).toBe(Event.Status.ONGOING);
});

test('event.startingStatus() returns ONGOING for events between 15 min to 2 hours running', () => {
  const isoStr = minutesFromNow(-60).toISOString();
  const event = new Event({
    id: "abc",
    fields: { Time: isoStr }
  });
  expect(event.startingStatus()).toBe(Event.Status.ONGOING);
});

test('event.startingStatus() returns PAST for events 2 hours ago or longer', () => {
  const isoStr = minutesFromNow(-180).toISOString();
  const event = new Event({
    id: "abc",
    fields: { Time: isoStr }
  });
  expect(event.startingStatus()).toBe(Event.Status.FINISHED);
});

test('event.toJSON() faithfully returns original JSON', ()=> {
  const json = {
    id: "abc",
    fields: { MaxAttendees: 5 }
  };
  expect(new Event(json).toJSON()).toBe(json);
});