###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:16-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

# ENV NODE_ENV production

RUN npm install

USER node

###################
# PRODUCTION
###################

FROM node:16-alpine As production
RUN apk add --no-cache tzdata
ENV TZ 'Asia/Ho_Chi_Minh'
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
