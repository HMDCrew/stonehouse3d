import { sendHttpReq } from "../../utils/api/http"

export class MapBoxMiddleware {

    constructor() {

    }

    build_route(profile, from = { lat, lng }, to = { lat, lng }) {
        return sendHttpReq({
            url: `https://api.mapbox.com/directions/v5/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}`,
            data: {
                overview: false,
                alternatives: true,
                steps: true,
                access_token: process.env.ROUTING_MAPBOX
            }
        })
    }
}