import { sendHttpReq } from "../utils/api/http"

export const crud = {

    create_location: ( latlng ) => sendHttpReq({
        url: stonehouse_data.json_url + 'save-house',
        data: {
            location: latlng
        },
        method: 'POST',
        headers: {
            'X-WP-Nonce': stonehouse_data.nonce
        },
    }),

    update_location: ({ house_id, title, lat, lng }) => sendHttpReq({
        url: stonehouse_data.json_url + 'update-house',
        data: {
            house_id,
            title: title,
            location: { lat, lng }
        },
        method: 'POST',
        headers: {
            'X-WP-Nonce': stonehouse_data.nonce
        },
    }),

    delete_location: ({ house_id }) => sendHttpReq({
        url: stonehouse_data.json_url + 'delete-house',
        data: { house_id },
        method: 'POST',
        headers: {
            'X-WP-Nonce': stonehouse_data.nonce
        },
    })
}