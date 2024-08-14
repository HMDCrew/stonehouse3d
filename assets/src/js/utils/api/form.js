/**
 * It returns a promise that resolves with the response of the request
 * @param url - The URL to send the request to.
 * @param {FormData} data - The JSON data paramiters
 * @param headers - The Request Headers
 * @returns A promise
 */
export const sendHttpForm = async ({ url, data, headers = {} }) => {
    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        let new_url = new URL(url);

        xhr.open('POST', new_url.href, true);

        Object.keys(headers).map(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        xhr.onload = () => {
            resolve(xhr.response);
        }

        xhr.onerror = () => {
            reject(xhr);
        }

        xhr.send(data);
    });
}