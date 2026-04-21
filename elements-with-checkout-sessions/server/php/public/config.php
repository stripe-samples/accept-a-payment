<?php

require_once '../vendor/autoload.php';
require_once '../secrets.php';

header('Content-Type: application/json');

echo json_encode(array('publishableKey' => $_ENV['STRIPE_PUBLISHABLE_KEY']));
