# Circling China Site

This project compiles to a statically generated website for https://circlingchina.org.


## How the site is built

The starting point of the site is a static export of a webflow project.
[Eleventy](https://www.11ty.dev/) is used to preprocess the html.
A couple of areas with complicated logic is rendered as a react component, and built with [Parcel](https://parceljs.org/).

The entire site is built to the `_site` folder, which can be easily hosted on a static host such as netlify.

There's no backend. Server side functionality are built via a collection of 3rd party services:
- Authentication: [netlify auth](https://docs.netlify.com/visitor-access/identity/)
- Blogposts: netlifycms.org
- Event and User tables: airtable.com

## Setup

**Development**

`npm run dev`

For localhost development, setup a [.env](.env) file:

`cp .env.sample .env`

(this file is designed to hold sensitive data, and should not be checked into source control)

**Build**

`npm run build`

**Staging Branch**

The `staging` branch is configured to auto-deploy to https://staging.circlingchina.org/ and can be used to test and demo experimental features
  

## API Server

There is a standalone nodejs server for emails, payments, and scheduling jobs. To deploy the server:

```
cd server
npm install
npm start
```

The server also has its own environment file, which can hold secrets not avaliable to the client(i.e aws SES credentials)

```
cd server
cp .env.sample .env
```

The server and client can both utilize modules in the /lib folder. So in theory, we should keep code in the lib folder isomorphic(able to run on both brower and node environment).