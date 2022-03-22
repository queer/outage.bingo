FROM nginx:alpine
COPY *.html *.js *.json img /usr/share/nginx/html/
