<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CMS runtime settings (spec section 5, custom CMS_* variables)
    |--------------------------------------------------------------------------
    */

    'default_locale' => env('CMS_DEFAULT_LOCALE', 'en'),

    'max_upload_mb' => (int) env('CMS_MAX_UPLOAD_MB', 15),

    'max_pdf_upload_mb' => 20,

    'preview_ttl_minutes' => (int) env('CMS_PREVIEW_TTL_MINUTES', 15),

    'public_base_url' => rtrim((string) env('CMS_PUBLIC_BASE_URL', 'http://localhost:3000'), '/'),

    'media' => [
        'private_prefix' => env('CMS_MEDIA_PRIVATE_PREFIX', 'private'),
        'public_prefix' => env('CMS_MEDIA_PUBLIC_PREFIX', 'published'),
        'temp_prefix' => env('CMS_MEDIA_TEMP_PREFIX', 'tmp'),
    ],

    'revisions_retention_days' => (int) env('CMS_REVISIONS_RETENTION_DAYS', 365),

    'revalidate' => [
        'url' => env('NEXT_REVALIDATE_URL', 'http://localhost:3000/api/internal/revalidate'),
        'secret' => env('NEXT_REVALIDATE_SECRET'),
        'timeout_seconds' => (int) env('NEXT_REVALIDATE_TIMEOUT_SECONDS', 5),
    ],

];
