import { sendHttpReq } from "../../utils/api/http"
import { decode } from "@mapbox/polyline"


export class MapBoxMiddleware {
    
    routeLineString;

    constructor() {
    }


    build_route(profile, { from = { lat, lng }, to = { lat, lng } }) {

        return new Promise((resolve, reject) => {

            sendHttpReq({
                url: `https://api.mapbox.com/directions/v5/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}`,
                data: {
                    overview: false,
                    alternatives: true,
                    steps: true,
                    access_token: process.env.ROUTING_MAPBOX
                }
            }).then(res => {

                res = JSON.parse(res)

                console.log(res)

                const steps = res.routes[0].legs[0].steps

                let result = []

                steps.forEach(step =>
                    result = [...result, ...decode(step.geometry, 5)]
                )

                // flip latitude e longitude
                result = result.map((item, idx) => [].concat(result[idx]).reverse())

                resolve(result)
            })
        })
    }
}