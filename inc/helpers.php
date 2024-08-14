<?php

if ( ! function_exists( 'wpr_async_js' ) ) {
	/**
	 * If the script tag contains the word "async" then return the tag as is, otherwise add the word
	 * "async" to the tag
	 *
	 * @param string tag The script tag.
	 *
	 * @return string str_replace() function is being used to replace the first occurrence of the string
	 * '<script' with the string '<script async'.
	 */
	function wpr_async_js( string $tag ) {
		return str_replace( '<script', '<script async', $tag );
	}
}


if ( ! function_exists( 'stonehouse_get_locations' ) ) {

	function stonehouse_get_locations() {

		$houses = new WP_Query(
			array(
				'post_type'   => 'house',
				'author' 	  => get_current_user_id(),
				'post_status' => array( 'publish', 'pending', 'draft', 'future', 'private', 'inherit' ),
				'orderby'     => 'date',
				'order'       => 'DESC',
			)
		);

		$api_map = array();

		foreach ( $houses->posts as $post ) {

			$api_map[] = array(
				'id'       => $post->ID,
				'location' => get_post_meta( $post->ID , 'location', true ),
				'title'    => $post->post_title
			);
		}

		return $api_map;
	}
}