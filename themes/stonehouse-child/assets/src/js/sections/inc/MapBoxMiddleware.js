import { sendHttpReq } from "../../utils/api/http"
import { decode, toGeoJSON, encode, fromGeoJSON } from "@mapbox/polyline"


export class MapBoxMiddleware {


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

                const steps = res.routes[0].legs[0].steps

                const result = []

                steps.forEach(step =>
                    result.push(
                        decode(step.geometry, 5)
                    )
                )

                resolve(result)
            })
        })
    }
}