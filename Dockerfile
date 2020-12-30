# To build the image type:
# > docker image build -t alexandrakarlsson/tastebudsback .
# To list the images
# > docker image ls
# To run the imges type:
# > docker container run -p 8000:8000 --rm alexandrakarlsson/tastebudsback

# To tag the image for docker hub storage
# > docker image tag hfb:latest unokarlsson/hfb:latest
# To push the image to docker hub
# > docker login
# > docker image push unokarlsson/hfb:latest

FROM node:12

RUN mkdir -p /home/node/app/data && mkdir -p /home/node/app/routers
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node data/*.js ./data/
COPY --chown=node:node routers/*.js ./routers/
COPY --chown=node:node *.js ./

EXPOSE 8000

CMD [ "node", "index.js" ]