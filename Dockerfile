FROM node:alpine
WORKDIR /usr/app
COPY ./app/package.json ./
RUN npm install
COPY ./app/ ./
CMD ["node", "app.js"]