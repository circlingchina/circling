# Circling China Site

This project compiles to a statically generated website for https://circlingchina.org.


## How the site is built

The starting point of the site is a static export of a webflow project.
[Eleventy](https://www.11ty.dev/) is used to preprocess the html.
A couple of areas with complicated logic is rendered as a react component, and built with [Parcel](https://parceljs.org/).

The entire site is built to the `_site` folder, which can be easily hosted on a static host such as netlify.

Server side functionality are built via a collection of 3rd party services:
- Authentication: [netlify auth](https://docs.netlify.com/visitor-access/identity/)
- Blogposts: netlifycms.org
- The data (Events and Users) is stored in postgres, and access via an API server located in the [server/](server/) directory.

## Setup

**Development**

For localhost development, setup a [.env](.env) file:

`cp .env.sample .env`

(this file is designed to hold sensitive data, and should not be checked into source control)

To start the web server:

`npm run dev`

**Build**

`npm run build`

**Staging Branch**

The `staging` branch is configured to auto-deploy to https://staging.circlingchina.org/ and can be used to test and demo experimental features
  

## API Server

Circling is based on an expressjs API server. To start the API server:

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

## Database

For local development, a postgresql service must be avaliable. The easiest way is via docker.

In the root directory of the project(NOTE: entire project, not /server):

```
docker-compose up -d db
```

### Database Initialization

To create the required tables, invoke the script [create_db.sh](server/db/create_db.sh):

```
db/create_db.sh
```

### Database: data migration

To copy data from Airtable, invoke the [migrate_airtable.js](server/db/migrate_airtable.js) script:

```
npm run migrate
```

Note that by default, NODE_ENV=development. This means the data from the test version of Airtable will be copied. Feel free to overide the base ID in migrate_airtable.js if you want production data in your test pg database.


# Deployment Instructions for circling-server

## Prerequisits for deploying to production:

- install docker: https://docs.docker.com/get-docker/
- install ansible: https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html
- add hosts to ansible (see detail below)
- ssh access to production servers (i.e put your id_rsa.pub in authorized_keys file)
- access to circling private repository (acquire a keyfile.json)

## Overview

The currently deployment flow is based on docker images with git commits as tags. Although is in anticipation of setting up CI/CD, the images are meant to be built **locally** at this point in time.

For example, let's make a trivia change in [server/index.js]:

![code feature](docs/images/code-feature.png)

Commit the change, so there is a new commit hash in the current branch.

```sh
git add server/index.js
git commit -m "incrementing the server version"
```

## Building Images

In the root directory of the project:

```sh
make build
```

![make build](docs/images/make-build.png)

Verify the images are built with:

```sh
docker images
```

![make build result](docs/images/make-build-result.png)

## Pushing to Container Repository

The circling project uses a private container registry (gcr.io). To push and pull you must login once:

```
mkdir ~/.circling-api
mv keyfile.json ~/.circling-api/
cat ~/.circling-api/keyfile.json | docker login -u _json_key --password-stdin https://gcr.io
```

![docker login](docs/images/docker-login.png)

For more info see: https://cloud.google.com/container-registry/docs/advanced-authentication#json-key

Once logged in, push builds with:

```sh
make push
```

![make push](docs/images/make-push.png)

## Deploying Builds

To deploy builds, you need to add the following lines to your ansible hosts file:


```sh
[circling]
35.199.171.128 ansible_user=deployer
```

Note: The hosts file is located in ```/etc/ansible/hosts``` on linux. If you can't find or need to customize location of the hosts file, see: https://stackoverflow.com/a/21959961

Test your setup by pinging the remote machines:

```sh
ansible circling-web -m ping
```

![ansible ping](docs/images/ansible-ping.png)

If the ping works, everything should be properly configured. Deploy via:

```sh
make deploy
```

Ansible should deploy the correct image:

![make deploy](docs/images/make-deploy.png)

Verify that the changes are live by visiting https://api.circlingchina.org/api/healthcheck in your browser:

![live change](docs/images/live-change.png)

## Day to Day Usage

The first time setup is a bit lengthy. But once you are set up, simply deploy with:

```
make 
```

The default make target will build, push, and deploy.

## Rolling Back

To rollback, specify a specific commit hash with a corresponding image. For example

```
make deploy 86d80cb
```

will deploy the image with the tag `86d80cb`

# Provisioning Instructions for circling-server

See [server/machine-config/README.md](server/machine-config/README.md) for instructions on provisioning


