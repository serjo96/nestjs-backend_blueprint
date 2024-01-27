#####################
## PREPARE BUILDER ##
#####################

FROM node:16 AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

#-----------------------------------------------------------

####################
## PREPARE RUNNER ##
####################

FROM node:16-alpine AS runner

ARG NODE_ENV
ENV NODE_ENV="${NODE_ENV:-production}"

WORKDIR /app
COPY --from=builder /app ./
ENV CONFIG=/config/.env

CMD yarn run start:${NODE_ENV}
