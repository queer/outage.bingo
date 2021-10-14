FROM nginx:alpine
COPY *.html *.js *.json /usr/share/nginx/html/
