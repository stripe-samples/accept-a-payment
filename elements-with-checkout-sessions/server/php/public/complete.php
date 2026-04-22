<?php

$staticDir = getenv('STATIC_DIR') ?: '../../client/html';

// Resolve relative path based on this file's directory
if ($staticDir[0] !== '/') {
    $staticDir = realpath(__DIR__ . '/../' . $staticDir);
}

$completePath = $staticDir . '/complete.html';

if (file_exists($completePath)) {
    header('Content-Type: text/html');
    readfile($completePath);
} else {
    http_response_code(404);
    echo 'complete.html not found';
}
