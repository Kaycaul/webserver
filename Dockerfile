FROM node:slim
WORKDIR /doeball-ca
COPY . .
RUN npm install
CMD [ "node" , "server/server.js" ]
EXPOSE 2763