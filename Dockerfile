FROM nginx:alpine

COPY ./dist /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

EXPOSE 80