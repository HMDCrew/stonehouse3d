/**
 * It returns a promise that resolves with the response of the request
 * @param url - The URL to send the request to.
 * @param data - The JSON data paramiters
 * @param method - The HTTP method to use, such as GET or POST
 * @param headers - The Request Headers
 * @returns A promise
 */
export const sendHttpReq = async ({ url, data = {}, method = 'GET', headers = {} }) => {
    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        let new_url = new URL(url);
        if ('GET' === method) {
            Object.keys(data).map(key => {
                new_url.searchParams.set(key, data[key]);
            });
        }

        xhr.open(method, new_url.href, true);

        Object.keys(headers).map(key => {
            xhr.setRequestHeader(key, headers[key]);
        });
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = () => {
            resolve(xhr.response);
        }

        xhr.onerror = () => {
            reject(xhr);
        }

        if ('GET' === method) {
            xhr.send();
        } else {
            xhr.send(JSON.stringify(data));
        }
    });
}