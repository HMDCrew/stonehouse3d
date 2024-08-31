// import marker from '../../images/marker.svg'
// import marker_success from '../../images/marker_success.svg'
// import marker_error from '../../images/marker_error.svg'
import { createElementFromHTML } from "../utils/dom_from_string"

export const defaults = {

    point_marker: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;animation: leaflet-control-locate-throb 4s ease infinite;"></circle></svg>',

    marker: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" class="marker" xml:space="preserve"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #464646" class="color-svg-identity" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',
    marker_success: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" xml:space="preserve" class="success"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #5cb85c;" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',
    marker_error: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 256 256" xml:space="preserve" class="error"><path style="fill: #fff; filter: drop-shadow(0 21px 20px rgba(0, 0, 0, .2));" d="M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z"/><path style="fill: #dc3545;" d="M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z"/></svg>',

    topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
    selected: "topografica",

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
    }
}