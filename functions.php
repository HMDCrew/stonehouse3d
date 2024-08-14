<?php

add_filter( 'xmlrpc_enabled', '__return_false' );

// Helpers WordPress
require_once __DIR__ . '/inc/helpers.php';

// Assets WordPress
require_once __DIR__ . '/inc/assets.php';

