FROM node:slim
WORKDIR /doeball-ca
COPY package.json .
RUN npm install
COPY . .
CMD [ "node" , "server/server.js" ]
EXPOSE 2763