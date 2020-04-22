# Circling China Site

[![Netlify Status](https://api.netlify.com/api/v1/badges/83a0a3a6-8dbc-4cb9-8857-d9a367fc55f2/deploy-status)](https://app.netlify.com/sites/circlingchina/deploys)

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
  

