# Local runtime with ext-mongodb (spec 11.1). Host PHP lacks the extension,
# so artisan/queue run here; MONGODB_URI must use the `mongo` hostname.
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libcurl4-openssl-dev pkg-config libssl-dev \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . /var/www/html

RUN composer install --optimize-autoloader --ignore-platform-req=ext-mongodb \
    && php artisan key:generate --show || true

EXPOSE 9000
# NOTE: `php artisan serve` strips process env down to a whitelist, which breaks
# env-driven config (MONGODB_URI, S3, ...). Plain `php -S` inherits full env.
CMD ["sh", "-c", "cd public && exec php -S 0.0.0.0:9000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php"]
