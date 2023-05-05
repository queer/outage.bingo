FROM nginx:alpine
COPY *.html *.js *.json /usr/share/nginx/html/
COPY ./img /usr/share/nginx/html/img
