<?php


/**
 * Filter function used to remove the tinymce emoji plugin.
 *
 * @param    array  $plugins
 * @return   array             Difference betwen the two arrays
 */
function disable_emojis_tinymce( $plugins ) {
	if ( is_array( $plugins ) ) {
		return array_diff( $plugins, array( 'wpemoji' ) );
	} else {
		return array();
	}
}


/**
 * The function disables emojis in WordPress by removing related actions and filters and adding a
 * filter to TinyMCE.
 */
function disable_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );

	// Remove from TinyMCE
	add_filter( 'tiny_mce_plugins', 'disable_emojis_tinymce' );
}
add_action( 'init', 'disable_emojis' );


/**
 * Manage JS file's Front-end
 */
function manage_js_front_end( $tag ) {

	$src = $tag;

	if (
		str_contains( $src, '/themes/asta/js/navigation.js' ) ||
		(
			( ! is_user_logged_in() || ! in_array( 'administrator', wp_get_current_user()->roles, true ) ) &&
			(
				str_contains( $src, '/wp-includes/js/jquery/jquery.min.js' ) ||
				str_contains( $src, '/wp-includes/js/jquery/jquery-migrate.min.js' ) ||
				str_contains( $src, '/wp-includes/js/jquery/jquery.js' ) ||
				str_contains( $src, '/wp-includes/js/jquery/jquery-migrate.js' )
			)
		)
	) {
		$src = '';
	}

	if (
	 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/index.bundle.js' )
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/home.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/login.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/register.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/profile.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/new_auction.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/new_product.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/archive_auctions.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/archive_shop.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/single_auction.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/single_shop.bundle.js' ) ||
	// 	str_contains( $src, get_stylesheet_directory_uri() . '/assets/dist/js/auth_user.bundle.js' )
	) {
	 	$src = wpr_async_js( $tag );
	}

	return $src;
}
add_filter( 'script_loader_tag', 'manage_js_front_end' );


/**
 * Manage CSS file's Front-end
 */
function manage_css_front_end( $tag ) {

	$src = $tag;

	if ( str_contains( $src, 'themes/stonehouse-child/style.css' ) ) {
		$src = '';
	}

	return $src;
}
add_filter( 'style_loader_tag', 'manage_css_front_end' );



/**
 * Add JS scripts Front-end
 */
function assets_js_front_end() {

	wp_enqueue_script( 'stonehouse', get_stylesheet_directory_uri() . '/assets/dist/js/index.bundle.js', array(), false, true );
	wp_localize_script(
		'stonehouse',
		'stonehouse_data',
		array(
			'json_url'  => get_rest_url(),
			'user_id'   => get_current_user_id(),
			'nonce'     => wp_create_nonce( 'wp_rest' ),
			'locations' => stonehouse_get_locations(),
		)
	);

	// wp_enqueue_script( 'asta', get_stylesheet_directory_uri() . '/assets/dist/js/index.bundle.js', array(), false, true );
	// wp_localize_script(
	// 	'asta',
	// 	'asta_data',
	// 	array(
	// 		'json_url'      => get_rest_url(),
	// 		'current_state' => wpr_front_information_queried_object(),
	// 	)
	// );
}
add_action( 'wp_enqueue_scripts', 'assets_js_front_end', 0 );


/**
 * Add Front-end CSS
 */
function assets_css_front_end() {

	wp_dequeue_style( 'global-styles' );
	wp_enqueue_style( 'stonehouse', get_stylesheet_directory_uri() . '/assets/dist/css/index.bundle.css' );
}
add_action( 'wp_enqueue_scripts', 'assets_css_front_end' );