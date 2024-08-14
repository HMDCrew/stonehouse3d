/**
 * The function `createElementFromHTML` creates a DOM element from an HTML string.
 * @param htmlString - The `htmlString` parameter is a string that represents an HTML element or a set
 * of HTML elements.
 * @returns the first child element of the div element created from the provided HTML string.
 */
export const createElementFromHTML = (htmlString) => {

    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()

    return div.firstChild
}
