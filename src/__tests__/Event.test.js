import Event from "../models/Event";

test('event isFull works', () => {
  const event1 = new Event({});
  expect(event1.isFull()).toBe(false);
});