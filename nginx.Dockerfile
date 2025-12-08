FROM nginx:alpine

# Copy nginx configuration files
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy static admin panel files (built in GitHub Actions)
COPY admin_panel/dist /usr/share/nginx/html/admin

# Create directories for SSL certificates and certbot
RUN mkdir -p /etc/nginx/ssl /var/www/certbot

# Expose ports
EXPOSE 80 443

