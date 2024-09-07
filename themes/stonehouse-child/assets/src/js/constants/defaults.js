import { createElementFromHTML } from "../utils/dom_from_string"
import { toRadians } from '../utils/toRadians.js'
import { toDegrees } from '../utils/toDegrees.js'

export const defaults = {

    point_marker: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;animation: leaflet-control-locate-throb 4s ease infinite;"></circle></svg>',

    marker: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" class="marker" xml:space="preserve"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #464646" class="color-svg-identity" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',
    marker_success: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" xml:space="preserve" class="success"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #5cb85c;" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',
    marker_error: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" xml:space="preserve" class="error"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #dc3545;" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',

    topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
    selected: "topografica",

    menu: {
        'houses': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="34px" width="34px" version="1.1" id="Layer_1" viewBox="0 0 281.067 281.067" xml:space="preserve" fill="#000000"><path style="fill:#a3a3a3;" d="M72.718,44.346L9.684,123.308C8.27,125.08,7.5,127.28,7.5,129.547v110.936h46.924v-42.219 c0-5.523,4.477-10,10-10h32.219c5.523,0,10,4.477,10,10v42.219h46.924V129.547c0-2.267-0.77-4.467-2.185-6.239L88.348,44.346 C84.345,39.331,76.721,39.331,72.718,44.346z" /><path style="fill:#d1d1d1;" d="M211.382,123.308l-63.034-78.962c-4.003-5.015-11.627-5.015-15.63,0l-22.185,27.791l40.849,51.171 c1.414,1.772,2.185,3.972,2.185,6.239c0,11.136,0,99.73,0,110.937c6.084,0,53.248,0,60,0V129.547 C213.567,127.28,212.796,125.08,211.382,123.308z" /><path style="fill:#FFFFFF;" d="M271.382,123.308l-63.034-78.962c-4.003-5.015-11.627-5.015-15.63,0l-22.185,27.791l40.849,51.171 c1.414,1.772,2.185,3.972,2.185,6.239c0,11.136,0,99.73,0,110.936c6.084,0,53.248,0,60,0V129.547 C273.567,127.28,272.796,125.08,271.382,123.308z" /><path style="fill:#3d3d3d;" d="M277.242,118.628l0.001,0.001L214.21,39.667c-7.015-8.786-20.353-8.768-27.354,0l-16.323,20.448 L154.21,39.667c-7.015-8.786-20.353-8.768-27.354,0l-16.323,20.448L94.21,39.667c-7.015-8.786-20.353-8.768-27.354,0 L3.824,118.628C1.358,121.716,0,125.594,0,129.547v110.937c0,4.142,3.357,7.5,7.5,7.5h46.924c4.143,0,7.5-3.358,7.5-7.5v-42.219 c0-1.378,1.121-2.5,2.5-2.5h32.219c1.379,0,2.5,1.122,2.5,2.5v42.219c0,4.142,3.357,7.5,7.5,7.5c15.24,0,151.662,0,166.925,0 c4.143,0,7.5-3.358,7.5-7.5V129.547C281.067,125.594,279.709,121.717,277.242,118.628z M146.066,232.983h-31.924v-34.719 c0-9.649-7.851-17.5-17.5-17.5H64.424c-9.649,0-17.5,7.851-17.5,17.5v34.719H15V129.547c0-0.565,0.193-1.119,0.546-1.56 l63.033-78.962c1.002-1.255,2.906-1.255,3.908,0l22.183,27.789c0.001,0.001,0.001,0.002,0.002,0.002l40.85,51.172 c0.311,0.39,0.545,0.974,0.545,1.559V232.983z M157.243,118.629L120.13,72.137l18.449-23.112c1.002-1.255,2.906-1.255,3.908,0 l22.183,27.789c0.001,0.001,0.001,0.001,0.002,0.002l23.274,29.155l17.575,22.016c0,0,0,0.001,0.001,0.001 c0.352,0.441,0.546,0.995,0.546,1.559v103.437h-45V129.547C161.067,125.594,159.709,121.717,157.243,118.629z M266.067,232.983 h-45V129.547c0-3.968-1.368-7.843-3.824-10.918L180.13,72.137l18.449-23.112c1.002-1.255,2.906-1.255,3.908,0l63.033,78.962 c0,0,0,0.001,0.001,0.001c0.351,0.441,0.546,0.995,0.546,1.559V232.983z" /></svg>',
        'my_location': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="black" d="M445 4 29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z"/></svg>',
    },

    popupMarker: (content, marker) => {
        
        const markerDOM = createElementFromHTML(marker)
        markerDOM.classList.add('static')

        return createElementFromHTML(
            `<div class="content-marker">
                <span class="popup">
                    ${content.outerHTML}
                    <span class="close-btn">×</span>
                    <span class="spacer"></span>
                </span>${markerDOM.outerHTML}
            </div>`
        )
    },

    saveLoactionBTN: () =>  {
        return createElementFromHTML(
            `<button class="btn btn-add-house">
                <svg fill="#000000" width="50px" height="50px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1524.824 1242.353c93.402 0 169.411 76.01 169.411 169.412v338.823c0 93.403-76.01 169.412-169.411 169.412H395.412C302.009 1920 226 1843.99 226 1750.588v-338.823c0-93.403 76.01-169.412 169.412-169.412ZM1016.588 0v338.824h-112.94V0h112.94ZM564.824 1468.235c62.343 0 112.94 50.71 112.94 112.941s-50.597 112.942-112.94 112.942c-62.344 0-112.942-50.71-112.942-112.942 0-62.23 50.598-112.94 112.942-112.94ZM903.647 338.824v428.385L657.322 520.885l-79.85 79.85 382.646 382.644 382.644-382.645-79.85-79.85-246.324 246.325V338.824h508.236c93.74 0 169.411 75.67 169.411 169.411v677.647c-46.306-35.011-106.164-56.47-169.411-56.47H395.412c-63.247 0-123.106 21.459-169.412 56.47V508.235c0-93.74 75.67-169.411 169.412-169.411h508.235Z" fill-rule="evenodd"></path>
                </svg>
                <span class="save-label">Save</span>
            </button>`
        ) 
    },
    
    foundMy: () => {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {

                reject({ status: "error", message: "Geolocation is not supported by your browser" })

            } else {

                navigator.geolocation.getCurrentPosition(

                    // success
                    (position) => {
                        resolve({ status: "success", lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy })
                    },

                    // error
                    () => {
                        reject({ status: "error", message: "Unable to retrieve your location" })
                    }
                );
            }
        })
    },

    /**
     * Returns the coordinate at the given distance and bearing from `c1`.
     *
     * @param {import("./coordinate.js").Coordinate} c1 The origin point (`[lon, lat]` in degrees).
     * @param {number} distance The great-circle distance between the origin
     *     point and the target point.
     * @param {number} bearing The bearing (in radians).
     * @param {number} [radius] The sphere radius to use.  Defaults to the Earth's
     *     mean radius using the WGS84 ellipsoid.
     * @return {import("./coordinate.js").Coordinate} The target point.
     */
    sphereOffset(c1, distance, bearing, radius) {

        const DEFAULT_RADIUS = 6371008.8;

        radius = radius || DEFAULT_RADIUS;

        const lat1 = toRadians(c1[1]);
        const lon1 = toRadians(c1[0]);
        const dByR = distance / radius;
        const lat = Math.asin(
            Math.sin(lat1) * Math.cos(dByR) +
            Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing),
        );

        const lon = lon1 + Math.atan2(
            Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
            Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat),
        );

        return [toDegrees(lon), toDegrees(lat)];
    }
}