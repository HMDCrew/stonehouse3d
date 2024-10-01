<?php
/**
 * The template for display front page
 *
 * This is the template that display front page by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site may use a
 * different template.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package Asta
 */

get_header();
?>

	<main id="primary" class="site-main">

		<div class="container">
			<?php
			while ( have_posts() ) :
				the_post();

				get_template_part( 'template-parts/content', 'front' );

			endwhile; // End of the loop.
			?>

			<div class="maps">

				<div class="navigation navigation-controlls-top closed">
					<div class="go-back">
						<svg fill="#fff" width="30px" height="30px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
							<path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"/>
						</svg>
					</div>
					<div class="indications">
						<span class="instruction">text</span>
					</div>
				</div>

				<div class="map">
					<div id="stonemap"></div>
					<div id="mini-map"></div>
				</div>
				<div class="details">

					<?php foreach ( stonehouse_get_locations() as $post ) : ?>

						<?php get_template_part( 'template-parts/house', 'item', $post ); ?>

					<?php endforeach; ?>
				</div>

				<div class="navigation navigation-controlls-bottom closed">
				
					<button type="button" class="btn btn-start-navigation">
						<svg width="50px" height="50px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="nonzero" clip-rule="nonzero" d="M4.12903 5.54839C2.70378 5.54839 1.54839 6.70378 1.54839 8.12903C1.54839 9.55428 2.70378 10.7097 4.12903 10.7097C5.28455 10.7097 6.26269 9.95022 6.59153 8.90323H4.64516C4.21759 8.90323 3.87097 8.55661 3.87097 8.12903C3.87097 7.70146 4.21759 7.35484 4.64516 7.35484H7.8144C8.17678 5.44449 9.85518 4 11.871 4C14.1514 4 16 5.84863 16 8.12903C16 10.4094 14.1514 12.2581 11.871 12.2581C10.0971 12.2581 8.58443 11.1394 8 9.56909C7.41558 11.1394 5.90294 12.2581 4.12903 12.2581C1.84863 12.2581 0 10.4094 0 8.12903C0 5.84863 1.84863 4 4.12903 4C4.94646 4 5.71059 4.23833 6.35292 4.64957C6.71302 4.88011 6.81804 5.35892 6.5875 5.71902C6.35695 6.07912 5.87814 6.18414 5.51805 5.9536C5.11749 5.69715 4.64182 5.54839 4.12903 5.54839ZM11.871 5.54839C10.4457 5.54839 9.29032 6.70378 9.29032 8.12903C9.29032 9.55428 10.4457 10.7097 11.871 10.7097C13.2962 10.7097 14.4516 9.55428 14.4516 8.12903C14.4516 6.70378 13.2962 5.54839 11.871 5.54839Z" fill="#fff"/>
						</svg>
					</button>

					<button type="button" class="btn btn-stop-navigation">

						<svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" fill="none">
							<path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM15.36 14.3C15.65 14.59 15.65 15.07 15.36 15.36C15.21 15.51 15.02 15.58 14.83 15.58C14.64 15.58 14.45 15.51 14.3 15.36L12 13.06L9.7 15.36C9.55 15.51 9.36 15.58 9.17 15.58C8.98 15.58 8.79 15.51 8.64 15.36C8.35 15.07 8.35 14.59 8.64 14.3L10.94 12L8.64 9.7C8.35 9.41 8.35 8.93 8.64 8.64C8.93 8.35 9.41 8.35 9.7 8.64L12 10.94L14.3 8.64C14.59 8.35 15.07 8.35 15.36 8.64C15.65 8.93 15.65 9.41 15.36 9.7L13.06 12L15.36 14.3Z" fill="#292D32"/>
						</svg>
					</button>
				</div>

			</div>
		</div>
	</main><!-- #main -->

<?php
get_footer();
