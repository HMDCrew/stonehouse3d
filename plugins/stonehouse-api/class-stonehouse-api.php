<?php
/**
 * Plugin Name: StoneHouse API
 * Plugin URI: #
 * Description: StoneHouse api routes
 * Version: 0.0.1
 * Author: Andrei Leca
 * Author URI:
 * Text Domain: stonehouse-api
 * License: MIT
 */

namespace STONEHOUSE_API;

// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'STONEHOUSE_API' ) ) :

	class STONEHOUSE_API {

		private static $instance;

		public static function instance() {
			if ( ! isset( self::$instance ) && ! ( self::$instance instanceof STONEHOUSE_API ) ) {
				self::$instance = new STONEHOUSE_API();
				self::$instance->constants();

				// Plugin Setup
				// add_action( 'after_setup_theme', array( self::$instance, 'includes' ), 10, 0 );
				add_action( 'setup_theme', array( self::$instance, 'includes' ), 10, 0 );
			}

			return self::$instance;
		}

		/**
		 * Constants
		 */
		public function constants() {
			// Plugin version
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_VERSION' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_VERSION', '0.0.1' );
			}

			// Plugin file
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_FILE' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_FILE', __FILE__ );
			}

			// Plugin basename
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_BASENAME' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_BASENAME', plugin_basename( STONEHOUSE_API_PLUGIN_FILE ) );
			}

			// Plugin directory path
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_DIR_PATH' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_DIR_PATH', trailingslashit( plugin_dir_path( STONEHOUSE_API_PLUGIN_FILE ) ) );
			}

			// Plugin directory URL
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_DIR_URL' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_DIR_URL', trailingslashit( plugin_dir_url( STONEHOUSE_API_PLUGIN_FILE ) ) );
			}

			// // Plugin URL assets
			// if ( ! defined( 'STONEHOUSE_API_PLUGIN_ASSETS' ) ) {
			// 	define( 'STONEHOUSE_API_PLUGIN_ASSETS', trailingslashit( STONEHOUSE_API_PLUGIN_DIR_URL . 'assets' ) );
			// }

			// Plugin directory classes
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_CLASSES' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_CLASSES', trailingslashit( STONEHOUSE_API_PLUGIN_DIR_PATH . 'classes' ) );
			}

			// Plugin directory templates
			if ( ! defined( 'STONEHOUSE_API_PLUGIN_TEMPLATES' ) ) {
				define( 'STONEHOUSE_API_PLUGIN_TEMPLATES', trailingslashit( STONEHOUSE_API_PLUGIN_DIR_PATH . 'templates' ) );
			}
		}

		/**
		 * Include/Require PHP files
		 */
		public function includes() {

			// // Helpers functions
			require_once STONEHOUSE_API_PLUGIN_DIR_PATH . 'inc/helpers.php';

			// Include class helpers
			require_once STONEHOUSE_API_PLUGIN_DIR_PATH . 'inc/class-homes-post-type-init.php';

			// API
			require_once STONEHOUSE_API_PLUGIN_CLASSES . 'class-homes-api-routes.php';

			// // API ednpoints auction
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'user/class-asta-theme-auth.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'user/class-asta-theme-profile.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'auction/class-asta-theme-edit-auction.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'auction/class-asta-theme-get-auction.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'chackout/class-asta-theme-bids.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'chackout/class-asta-theme-sold-process.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'chackout/class-asta-theme-chackout.php';

			// // API ednpoints shop
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'shop/class-asta-theme-edit-product.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'shop/class-asta-theme-get-product.php';

			// // Dashboard
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'dashboard/class-gateway-payments.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'orders/class-asta-theme-orders.php';
			// require_once STONEHOUSE_API_PLUGIN_CLASSES . 'auction/class-asta-gutenberg-metaboxes.php';

			\HOMES_POST_TYPE_INIT::instance();
			\HOMES_API_ROUTES::instance();
			// \ASTA_THEME_SOLD_PROCESS::instance();
			// \ASTA_THEME_AUTH::instance();
			// \ASTA_THEME_PROFILE::instance();
			// \ASTA_THEME_EDIT_AUCTION::instance();
			// \ASTA_THEME_EDIT_PRODUCT::instance();
			// \ASTA_THEME_GET_AUCTION::instance();
			// \ASTA_THEME_BIDS::instance();
			// \ASTA_THEME_CHACKOUT::instance();
			// \Gateway_Payments::instance();
			// \ASTA_THEME_ORDERS::instance();
			// \ASTA_GUTENBERG_METABOXES::instance();
		}
	}

endif;

STONEHOUSE_API::instance();