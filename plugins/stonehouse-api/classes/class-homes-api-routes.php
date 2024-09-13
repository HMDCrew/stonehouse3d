<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'HOMES_API_ROUTES' ) ) :
	class HOMES_API_ROUTES {

		private static $instance;

		public static function instance() {
			if ( ! isset( self::$instance ) && ! ( self::$instance instanceof HOMES_API_ROUTES ) ) {
				self::$instance = new HOMES_API_ROUTES();
				self::$instance->hooks();
			}

			return self::$instance;
		}


        /**
		 * This function adds meta boxes and enqueues styles for the order page in the WordPress admin panel.
		 */
		public function hooks() {
			add_action( 'rest_api_init', array( $this, 'stonehouse_rest_api' ), 10 );
		}


        public function stonehouse_rest_api( \WP_REST_Server $server ) {

            $server->register_route(
				'rest-api-wordpress',
				'/save-house',
				array(
					'methods'  => 'POST',
					'callback' => array( $this, 'save_house' ),
					'user_id'  => get_current_user_id(),
				)
			);

			$server->register_route(
				'rest-api-wordpress',
				'/update-house',
				array(
					'methods'  => 'POST',
					'callback' => array( $this, 'update_house' ),
					'user_id'  => get_current_user_id(),
				)
			);

			$server->register_route(
				'rest-api-wordpress',
				'/delete-house',
				array(
					'methods'  => 'POST',
					'callback' => array( $this, 'delete_house' ),
					'user_id'  => get_current_user_id(),
				)
			);
		}


		/**
		 * It takes a regex string and an array, and returns the array with all the values cleaned by the
		 * regex
		 *
		 * @param string regex_val The regex to use to clean the array.
		 * @param array array The array to be cleaned.
		 *
		 * @return array of cleaned data.
		 */
		private function regex_applied_array( string $regex_val, array $callback ) {

			$cleaned = array();
			foreach ( $callback as $key => $value ) {

				$clean_key = preg_replace( '/[^0-9a-zA-Z\-\_]/i', '', $key );
				if ( ! is_array( $value ) ) {

					$clean_val = preg_replace( $regex_val, '', $value );

					$cleaned[ $clean_key ] = $clean_val;

				} else {
					$cleaned[ $clean_key ] = $this->regex_applied_array( $regex_val, $value );
				}
			}

			return $cleaned;
		}


        public function save_house( \WP_REST_Request $request ) {

            $params   = $request->get_params();
			$attr     = $request->get_attributes();
            $user_id  = ( ! empty( $attr['user_id'] ) ? preg_replace( '/[^0-9]/i', '', $attr['user_id'] ) : 0 );

			if ( $user_id ) {

				$location = (
					! empty( $params['location'] )
					? $this->regex_applied_array( '/[^0-9\.\-]/i', $params['location'] )
					: array()
				);

				if ( ! empty( $location ) ) {

					$location_args = array(
						'post_title'  => sprintf( 'new house in lat: %f, lng: %f', $location['lat'], $location['lng'] ),
						'post_author' => $user_id,
						'post_type'   => 'house',
						'meta_input'  => array(
							'location' => array(
								'lat' => $location['lat'],
								'lng' => $location['lng']
							)
						),
					);

					$location_id = wp_insert_post( $location_args );
				}

				wp_send_json(
					array(
						'status'  => 'success',
						'message' => array(
							'id'       => $location_id,
							'title'    => $location_args['post_title'],
							'location' => array(
								'lat' => $location['lat'],
								'lng' => $location['lng']
							),
						),
					),
				);
			}

			wp_send_json(
				array(
					'status'  => 'error',
					'message' => 'Autentication required',
				),
			);
        }


        public function update_house( \WP_REST_Request $request ) {

            $params   = $request->get_params();
			$attr     = $request->get_attributes();
            $user_id  = ( ! empty( $attr['user_id'] ) ? (int) preg_replace( '/[^0-9]/i', '', $attr['user_id'] ) : 0 );
			$house_id = ( ! empty( $params['house_id'] ) ? (int) preg_replace( '/[^0-9]/i', '', $params['house_id'] ) : 0 );
			$title    = ( ! empty( $params['title'] ) ? preg_replace( '/[^a-zA-Z0-9\s\@\!\?\,\.\-\_]/i', '', $params['title'] ) : 'new house' );

			if ( $user_id && $house_id && (int) get_post_field( 'post_author', $house_id ) === $user_id ) {
				
				$location = (
					! empty( $params['location'] )
					? $this->regex_applied_array( '/[^0-9\.\-]/i', $params['location'] )
					: array()
				);

				wp_update_post(
					array(
						'ID'           => $house_id,
						'post_title'   => $title,
						'meta_input'   => array(
							'location' => array(
								'lat'  => $location['lat'],
								'lng'  => $location['lng']
							)
						),
					)
				);

				wp_send_json(
					array(
						'status'  => 'success',
						'message' => array(
							'id'       => $house_id,
							'title'    => $title,
							'location' => array(
								'lat'  => $location['lat'],
								'lng'  => $location['lng']
							)
						),
					),
				);
			}

			wp_send_json(
				array(
					'status'  => 'error',
					'message' => 'is not possible update this house',
					'test' => array(
						'user_id'     => $user_id,
						'title'       => $params,
						'house_id'    => $house_id,
						'post_author' => get_post_field( 'post_author', $house_id ),
						'param'       => $request->get_query_params(),
						'has_valid'   => $request->has_valid_params()
					)
				),
			);
		}


        public function delete_house( \WP_REST_Request $request ) {

            $params   = $request->get_params();
			$attr     = $request->get_attributes();
            $user_id  = ( ! empty( $attr['user_id'] ) ? (int) preg_replace( '/[^0-9]/i', '', $attr['user_id'] ) : 0 );
			$house_id = ( ! empty( $params['house_id'] ) ? (int) preg_replace( '/[^0-9]/i', '', $params['house_id'] ) : 0 );

			if ( $user_id && $house_id && (int) get_post_field( 'post_author', $house_id ) === $user_id ) {
				
				wp_delete_post( $house_id );

				wp_send_json(
					array(
						'status'  => 'success',
						'message' => 'location has been removed',
					),
				);
			}

			wp_send_json(
				array(
					'status'  => 'error',
					'message' => 'is not possible remove this location',
				),
			);
		}
    }
endif;

HOMES_API_ROUTES::instance();
