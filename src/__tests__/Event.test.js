import Event from "../models/Event";

test('constructor validates json for id', () => {
  expect(() => new Event({})).toThrowError(new Error("event must have id"));
});

test('event isFull returns false when there are less users than MaxAttendee', () => {
  const event1 = new Event({
    id: "abc",
    max_attendees: 7,
    attendees: [
      {
        id: "user_id_1"
      },
    ],
  });
  expect(event1.isFull()).toBe(false);
});

test('event isFull returns true when event is full', () => {
  const event1 = new Event({
    id: "abc",
    max_attendees: 1,
    attendees: [
      {
        id: "user_id_1"
      },
    ],
  });
  expect(event1.isFull()).toBe(true);
});

test('event isFull returns true when MaxAttendee is 0', () => {
  const event1 = new Event({
    id: "abc",
    max_attendees: 0,
  });
  expect(event1.isFull()).toBe(true);
});

test('event.isUserAttending() returns true if and only if userId is in event', () => {
  const event1 = new Event({
    id: "abc",
    attendees: [{id: "user-id-1"}, {id: "user-id-2"}],
  });
  expect(event1.isUserAttending("user-id-0")).toBe(false);
  expect(event1.isUserAttending("user-id-1")).toBe(true);
  expect(event1.isUserAttending("user-id-2")).toBe(true);
});

const minutesFromNow = (minutes) => {
  return new Date(new Date().getTime() + (minutes * 60 * 1000));
};

test('event.startingStatus() returns NOT_STARTED for events 2 hours into future', () => {
  const isoStr = minutesFromNow(300).toISOString();
  const event = new Event({
    id: "abc",
    start_time: isoStr
  });

  expect(event.startingStatus()).toBe(Event.Status.NOT_STARTED);
});


test('event.startingStatus() returns STARTING_SOON for events within 2 hours', () => {
  const isoStr = minutesFromNow(60).toISOString();
  const event = new Event({
    id: "abc",
    start_time: isoStr
  });

  expect(event.startingStatus()).toBe(Event.Status.STARTING_SOON);
});

test('event.startingStatus() returns ONGOING for events between 15 min to 2 hours running', () => {
  const isoStr = minutesFromNow(10).toISOString();
  const event = new Event({
    id: "abc",
    start_time: isoStr
  });
  expect(event.startingStatus()).toBe(Event.Status.ONGOING);
});

test('event.startingStatus() returns ONGOING for events between 15 min to 2 hours running', () => {
  const isoStr = minutesFromNow(-60).toISOString();
  const event = new Event({
    id: "abc",
    start_time: isoStr
  });
  expect(event.startingStatus()).toBe(Event.Status.ONGOING);
});

test('event.startingStatus() returns PAST for events 2 hours ago or longer', () => {
  const isoStr = minutesFromNow(-180).toISOString();
  const event = new Event({
    id: "abc",
    start_time: isoStr
  });
  expect(event.startingStatus()).toBe(Event.Status.FINISHED);
});

test('event.toJSON() faithfully returns original JSON', ()=> {
  const json = {
    id: "abc",
    max_attendees: 5
  };
  expect(new Event(json).toJSON()).toBe(json);
});