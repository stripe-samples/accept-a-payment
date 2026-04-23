<?php
// Router script for PHP built-in server
// Serves PHP API endpoints from public/ and static files from client/html/public/

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/secrets.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$publicDir = __DIR__ . '/public';
$envStaticDir = getenv('STATIC_DIR') ?: '../../client/html';
if ($envStaticDir[0] !== '/') {
    $staticDir = realpath(__DIR__ . '/' . $envStaticDir) ?: __DIR__ . '/' . $envStaticDir;
} else {
    $staticDir = $envStaticDir;
}

// Check if it's a PHP endpoint in public/
$phpFile = $publicDir . $uri . '.php';
if (file_exists($phpFile)) {
    chdir($publicDir);
    require $phpFile;
    return true;
}

// Check for exact PHP file (e.g., /config.php)
$phpFileDirect = $publicDir . $uri;
if (preg_match('/\.php$/', $uri) && file_exists($phpFileDirect)) {
    chdir($publicDir);
    require $phpFileDirect;
    return true;
}

// Serve static files from client/html/public/
$staticFile = $staticDir . $uri;
if (file_exists($staticFile) && !is_dir($staticFile)) {
    // Set content type based on extension
    $ext = pathinfo($staticFile, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'svg'  => 'image/svg+xml',
    ];
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($staticFile);
    return true;
}

// Default: serve index.html from static dir or return 404
if ($uri === '/') {
    $indexFile = $staticDir . '/index.html';
    if (file_exists($indexFile)) {
        header('Content-Type: text/html');
        readfile($indexFile);
        return true;
    }
}

// Let PHP built-in server handle the rest (404)
return false;
