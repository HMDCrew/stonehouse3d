<?php

defined( 'ABSPATH' ) || exit;

list(
    'house_id' => $house_id,
	'location' => $location,
) = $args;

?>

<div class="location">

    <div class="d-flex">
        <span>Latitude: </span>
        <input type="text" name="coordinate[lat]" placeholder="Latitude" value="<?php echo ( ! empty( $location ) ? $location['lat'] : '' ); ?>">
    </div>

    <div class="d-flex">
        <span>Longitude: </span>
        <input type="text" name="coordinate[lng]" placeholder="Longitude" value="<?php echo ( ! empty( $location ) ? $location['lng'] : '' ); ?>">
    </div>

    <div id="map_location"></div>
</div>