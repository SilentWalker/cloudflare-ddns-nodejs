FROM node:18-alpine 

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY package*.json ./ 
RUN npm install --omit=dev
COPY . . 

CMD [ "node", "index.js"]