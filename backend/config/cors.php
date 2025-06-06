<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */
    'paths' => ['api/*', 'login', 'logout', 'sanctum/csrf-cookie', 'user'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000', 
        'http://localhost', 
        'https://visionaryfuture.shop',
        'https://www.visionaryfuture.shop',
        'https://api.visionaryfuture.shop'
    ], // 本番環境のドメインを追加
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
