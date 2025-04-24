FROM nginx:1.25-alpine

# Eliminar la configuración predeterminada de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Crear directorio para archivos estáticos
RUN mkdir -p /home/app/staticfiles

# Permitir que nginx escriba en sus directorios de caché
RUN chmod 777 /var/cache/nginx /var/run /var/log/nginx

# No ejecutamos como usuario nginx para evitar problemas de permisos
# USER nginx 