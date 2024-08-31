<?php

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'stonehouse_plugin_get_template_part' ) ) {

    /**
     * The function `stonehouse_get_template_part` is used to include template files in a WordPress plugin, with
     * the ability to pass arguments to the template.
     *
     * @param string plugin_template_path The `plugin_template_path` parameter is a string that represents
     * the path to the plugin template directory. This is the directory where the template files are
     * located.
     * @param string slug The "slug" parameter is a string that represents the name or identifier of the
     * template file you want to include. It is typically used to specify the specific template file
     * within a theme or plugin.
     * @param string name The "name" parameter is an optional parameter that allows you to specify a
     * specific template file to be used. If provided, it will be appended to the slug with a hyphen ("-")
     * and used as the template file name.
     * @param array args The "args" parameter is an optional array that allows you to pass additional data
     * to the template file. This data can be accessed within the template using the "extract" function.
     */
    function stonehouse_plugin_get_template_part( string $plugin_template_path, string $slug, string $name = null, array $args = array() ) {

        do_action( "stonehouse_plugin_get_template_part_{$slug}", $slug, $name );

        $templates = array();
        if ( isset( $name ) ) {
            $templates[] = "{$slug}-{$name}.php";
        }

        $templates[] = "{$slug}.php";

        stonehouse_plugin_get_template_path( $plugin_template_path, $templates, $args, true, false );
    }
}


if ( ! function_exists( 'stonehouse_plugin_get_template_path' ) ) {
    /**
     * The function `stonehouse_plugin_get_template_path` searches for a template file within a specified plugin
     * directory and loads it if specified.
     *
     * @param string plugin_template_path The parameter `plugin_template_path` is a string that represents
     * the path to the directory where the plugin templates are located.
     * @param array template_names An array of template names to search for within the plugin template
     * path.
     * @param array args The `` parameter is an array that contains any additional arguments that you
     * want to pass to the template file. These arguments can be accessed within the template file using
     * the `` variable.
     * @param bool load A boolean value indicating whether to load the template file or not. If set to
     * true, the template file will be loaded using the `load_template()` function.
     * @param bool require_once A boolean value indicating whether the template file should be required
     * once or not. If set to true, the template file will only be included once, preventing multiple
     * inclusions.
     *
     * @return string path of the located template file.
     */
    function stonehouse_plugin_get_template_path( string $plugin_template_path, array $template_names, array $args, bool $load = false, bool $is_require_once = true ) {
        $located = '';
        foreach ( (array) $template_names as $template_name ) {
            if ( ! $template_name ) {
                continue;
            }

            /* search file within the PLUGIN_DIR_PATH only */
            if ( file_exists( $plugin_template_path . $template_name ) ) {
                $located = $plugin_template_path . $template_name;
                break;
            }
        }

        if ( $load && '' !== $located ) {
            load_template( $located, $is_require_once, $args );
        }

        return $located;
    }
}