FROM nginx:1.25-alpine

# Delete the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Create directory for static files
RUN mkdir -p /home/app/staticfiles

# Allow nginx to write in its cache directories
RUN chmod 777 /var/cache/nginx /var/run /var/log/nginx
