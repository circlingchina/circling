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

Development

`npm run dev`

Build

`npm run build`


## TODOs
  
- Add wechat/alipay (need account)
- Add email service on key events
  - first time join event
  - scheduled emails 2 hours before event
- login redirect, logout redirect
- mobile nav improvement
- first time login popup (查看活动, or auto-redirect)
- tutorial walkthrough
- leader account types
- next-event status
- https://shimo.im/docs/ne3VVNJJ88s8FB3b
