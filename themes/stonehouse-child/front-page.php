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
				<div class="map">
					<div id="stonemap"></div>
					<div id="mini-map"></div>
				</div>
				<div class="details">

					<?php foreach ( stonehouse_get_locations() as $post ) : ?>

						<?php get_template_part( 'template-parts/house', 'item', $post ); ?>

					<?php endforeach; ?>
				</div>

				<button type="button" class="btn focus-location">start navigation</button>
			</div>
		</div>
	</main><!-- #main -->

<?php
get_footer();
