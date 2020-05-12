## A standalone nodejs API server for circling

To run the server, starting from project root:

```
cd server
```

Copy .env
```
cp .env.sample .env
```

Note: you must add necessary credentials (i.e airtable API, AWS-key) to your local copy of .env

To start the server process

```
npm start
```

This starts a server on port 4567. The client should be setup to connect to this port by default.


## Docker Builds

[Dockerfile] builds an image that can be ran in either development or production

Building an image

```
docker build -t circling-server .
```

Running the image

```
docker run --name circling-server -p 4567:4567 -d circling-server
```

## Production Deployment

* Provision a Ubuntu machine somewhere(i.e AWS EC2, Aliyun, Digitalocean droplet)
* Configure IP of machine in netlify DNS
* Setup deployer user with SSH Permission
* Install nginx, PM2
* Deploy via SSH
* Deploy via CI/CD (Github Actions)
