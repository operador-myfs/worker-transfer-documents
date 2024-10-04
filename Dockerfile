FROM node:16-alpine

ARG WORKER_TYPE

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build

ENV WORKER_TYPE=${WORKER_TYPE}

CMD ["node", "dist/index.js"]
