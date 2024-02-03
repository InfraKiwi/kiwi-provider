ARG NODE_VERSION

FROM node:${NODE_VERSION}
RUN corepack enable

WORKDIR /project

ADD package.json .
ADD yarn.lock .
ADD .yarnrc.yml .

RUN ls -al
# How ugly can this go
# https://github.com/yarnpkg/berry/issues/3972
RUN yarn || yarn

ADD tsconfig.json .

ADD src ./src
ADD cmd ./cmd
ADD prisma ./prisma
ADD jest.config.cjs .

RUN yarn test
RUN yarn pkg