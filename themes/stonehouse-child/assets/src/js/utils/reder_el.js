/**
 * The function `reder_el` creates a new HTML element with the specified content, class name, and tag,
 * and returns the element.
 * @param [content] - The content parameter is a string that represents the inner HTML content of the
 * element. It is optional and defaults to an empty string if not provided.
 * @param [class_name] - The class_name parameter is used to specify the CSS class name that you want
 * to add to the created element.
 * @param [tag=div] - The `tag` parameter is used to specify the HTML tag of the element that will be
 * created. By default, it is set to `'div'`, which means that if no value is provided for the `tag`
 * parameter when calling the `reder_el` function, a `<div>` element
 * @returns a newly created HTML element with the specified content, class name, and tag.
 */
export const reder_el = (tag = 'div', classes = [], content = '') => {
    const el = document.createElement(tag)

    if( classes.length ) {
        classes.forEach(class_item => {
            el.classList.add(class_item)
        });
    }

    el.innerHTML = content
    return el
}