<?php

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Also set via putenv so getenv() works in endpoint files
foreach ($_ENV as $key => $value) {
    putenv("$key=$value");
}

$stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'];
