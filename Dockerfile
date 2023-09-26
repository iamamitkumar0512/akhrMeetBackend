# FROM node:20

# WORKDIR /usr/src/app

# COPY . .

# RUN npm install

# CMD [ "npm","start" ]

# EXPOSE 3000

FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

CMD [ "run", "start" ]

EXPOSE 3000