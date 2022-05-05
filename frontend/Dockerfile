FROM node:current-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts -g --silent
COPY . ./
ENV REACT_APP_DOMAIN=https://gruppe4.testsites.info
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
