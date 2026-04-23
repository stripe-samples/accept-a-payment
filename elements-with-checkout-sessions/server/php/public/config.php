<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  exit();
}

header('Content-Type: application/json');

echo json_encode(array('publishableKey' => $_ENV['STRIPE_PUBLISHABLE_KEY']));
