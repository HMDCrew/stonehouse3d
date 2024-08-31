<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'HOMES_POST_TYPE_INIT' ) ) :
	class HOMES_POST_TYPE_INIT {

		private static $instance;

		public static function instance() {
			if ( ! isset( self::$instance ) && ! ( self::$instance instanceof HOMES_POST_TYPE_INIT ) ) {
				self::$instance = new HOMES_POST_TYPE_INIT();
				self::$instance->hooks();
			}

			return self::$instance;
		}


        /**
		 * This function adds meta boxes and enqueues styles for the order page in the WordPress admin panel.
		 */
		public function hooks() {
			add_action( 'init', array( $this, 'stonehouse_init_post_type' ) );
            add_action( 'add_meta_boxes', array( $this, 'stonehouse_metaboxes' ) );
            add_action( 'save_post', array( $this, 'save_stonehouse' ) );
		}


        public function stonehouse_metaboxes() {
			add_meta_box( 'stonehouse_description_metabox', __( 'Description', 'stonehouse-api' ), array( $this, 'render_stonehouse_description_metabox' ), 'house', 'normal', 'high' );
			add_meta_box( 'stonehouse_location_metabox', __( 'Location', 'stonehouse-api' ), array( $this, 'render_stonehouse_location_metabox' ), 'house', 'normal', 'high' );
		}


        public function stonehouse_init_post_type() {
            register_post_type(
                'house',
                array(
                    'labels'            => array(
                        'name'          => __( 'Homes' ),
                        'singular_name' => __( 'Home' ),
                        'add_new'       => __( 'Add New Home' ),
                        'add_new_item'  => __( 'Add New Home' ),
                        'edit_item'     => __( 'Edit Home' ),
                        'new_item'      => __( 'New Home' ),
                        'all_items'     => __( 'All Homes' ),
                        'view_item'     => __( 'View Home' ),
                        'search_items'  => __( 'Search Home' ),
                    ),
                    'description'       => 'Colection of all forgotten houses',
                    'public'            => true,
                    'menu_position'     => 5,
                    'supports'          => array( 'title' ),
                    'has_archive'       => true,
                    'x_has_single'      => false,
                    'show_in_admin_bar' => true,
                    'show_in_nav_menus' => true,
                    'query_var'         => true,
                )
            );
        }


        public function render_stonehouse_description_metabox( WP_Post $house ) {

			$description = get_post_meta( $house->ID, 'description', true );

			stonehouse_plugin_get_template_part(
				STONEHOUSE_API_PLUGIN_TEMPLATES,
				'description/description',
				'metabox',
				array(
                    'house_id'    => $house->ID,
					'description' => $description,
				)
			);
		}

        public function render_stonehouse_location_metabox( WP_Post $house ) {

            $location = get_post_meta( $house->ID, 'location', true );

			stonehouse_plugin_get_template_part(
				STONEHOUSE_API_PLUGIN_TEMPLATES,
				'location/location',
				'metabox',
				array(
                    'house_id'    => $house->ID,
					'location'    => $location,
				)
			);
        }

        public function save_stonehouse( $post_id ) {

            if ( current_user_can( 'edit_posts' ) ) {

                if ( ! empty( $_POST['description'] ) ) {
                    $description = sanitize_text_field( $_POST['description'] );
                    update_post_meta( $post_id, 'description', $description );
                }

                if ( ! empty( $_POST['coordinate'] ) ) {
                    update_post_meta( $post_id, 'location', array( 'lat' => $_POST['coordinate']['lat'], 'lng' => $_POST['coordinate']['lng'],  ) );
                }
            }
            
            return $post_id;
        }
    }
endif;

HOMES_POST_TYPE_INIT::instance();
