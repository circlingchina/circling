import Airtable from 'airtable';

const base = new Airtable({ 
    apiKey: process.env.AIRBASE_API_KEY 
}).base("app53ecZ2UL9M6JOw");

export const Users =  base('Users');
export const OpenEvents = base('OpenEvents');
