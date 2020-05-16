FROM node:alpine

ENV NODE_ENV=production
ENV PORT=4567

WORKDIR /app
COPY package*.json /app/
RUN npm install

WORKDIR /app/server
COPY server/package*.json /app/server/
RUN npm install

COPY src /app/src/
COPY server /app/server/

ENTRYPOINT [ "npm", "start" ]
EXPOSE $PORT