<?php

defined( 'ABSPATH' ) || exit;

list(
    'house_id'    => $house_id,
	'description' => $description,
) = $args;

?>

<div class="description">
    <textarea name="description" id=""><?php echo $description; ?></textarea>
</div>