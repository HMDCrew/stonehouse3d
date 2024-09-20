import walking from '../../images/walking.svg'
import cycling from '../../images/cycling.svg'
import car from '../../images/car.svg'
import destination from '../../images/destination.svg'


export const defaults = {

    topografica: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
    geografica: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    roards: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
    selected: "topografica",

    point_marker: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="-12 -12 24 24"><circle r="9" style="stroke:#fff;stroke-width:3;fill:#2A93EE;fill-opacity:1;opacity:1;animation: leaflet-control-locate-throb 4s ease infinite;"></circle></svg>',

    marker: (type = 'default') => {

        const color = (
            type == 'default'
                ? "#464646"
                : (
                    type == 'success'
                    ? "#5cb85c"
                    : "#dc3545"
                )
        )

        return {
            'markerType': 'path',
            'markerPath' : [
                {
                    path: "M128.18,249.042c-4.252,0-8.151-2.365-10.114-6.137L64.648,140.331c-0.082-0.156-0.159-0.313-0.233-0.474 C55.837,121.342,47.9,101.865,47.9,84.859c0-20.079,8.655-40.271,23.747-55.4c15.512-15.549,35.68-24.113,56.787-24.113 c21.099,0,41.188,8.579,56.57,24.155c14.904,15.093,23.453,35.271,23.454,55.358c0,18.868-9.282,38.867-16.062,53.47l-0.707,1.526 c-0.07,0.152-0.146,0.306-0.224,0.453l-53.159,102.574c-1.959,3.778-5.859,6.151-10.116,6.156 C128.188,249.042,128.184,249.042,128.18,249.042z",
                    fill: "#fff",
                    filter: "drop-shadow(0 21px 20px rgba(0, 0, 0, .2))"
                }, {
                    path: "M128.052,16.75c-37.729,0-69.129,32.667-69.129,68.109c0,15.947,8.973,36.204,15.459,50.204l53.417,102.574 l53.162-102.574c6.484-13.999,15.711-33.242,15.711-50.203C196.671,49.418,165.773,16.75,128.052,16.75z M127.025,113.857 c-16.585,0-30.031-13.445-30.031-30.03s13.445-30.03,30.031-30.03c16.584,0,30.03,13.445,30.03,30.03 S143.609,113.857,127.025,113.857z",
                    fill: color
                }
            ],
            'markerPathWidth' : 256,
            'markerPathHeight' : 256,
            'markerWidth': 50,
            'markerHeight': 50,
        }
    },

    menu: {
        'houses': '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="34px" width="34px" version="1.1" id="houses-svg-icon" viewBox="0 0 281.067 281.067" xml:space="preserve" fill="#000000"><path style="fill:#a3a3a3;" d="M72.718,44.346L9.684,123.308C8.27,125.08,7.5,127.28,7.5,129.547v110.936h46.924v-42.219 c0-5.523,4.477-10,10-10h32.219c5.523,0,10,4.477,10,10v42.219h46.924V129.547c0-2.267-0.77-4.467-2.185-6.239L88.348,44.346 C84.345,39.331,76.721,39.331,72.718,44.346z" /><path style="fill:#d1d1d1;" d="M211.382,123.308l-63.034-78.962c-4.003-5.015-11.627-5.015-15.63,0l-22.185,27.791l40.849,51.171 c1.414,1.772,2.185,3.972,2.185,6.239c0,11.136,0,99.73,0,110.937c6.084,0,53.248,0,60,0V129.547 C213.567,127.28,212.796,125.08,211.382,123.308z" /><path style="fill:#FFFFFF;" d="M271.382,123.308l-63.034-78.962c-4.003-5.015-11.627-5.015-15.63,0l-22.185,27.791l40.849,51.171 c1.414,1.772,2.185,3.972,2.185,6.239c0,11.136,0,99.73,0,110.936c6.084,0,53.248,0,60,0V129.547 C273.567,127.28,272.796,125.08,271.382,123.308z" /><path style="fill:#3d3d3d;" d="M277.242,118.628l0.001,0.001L214.21,39.667c-7.015-8.786-20.353-8.768-27.354,0l-16.323,20.448 L154.21,39.667c-7.015-8.786-20.353-8.768-27.354,0l-16.323,20.448L94.21,39.667c-7.015-8.786-20.353-8.768-27.354,0 L3.824,118.628C1.358,121.716,0,125.594,0,129.547v110.937c0,4.142,3.357,7.5,7.5,7.5h46.924c4.143,0,7.5-3.358,7.5-7.5v-42.219 c0-1.378,1.121-2.5,2.5-2.5h32.219c1.379,0,2.5,1.122,2.5,2.5v42.219c0,4.142,3.357,7.5,7.5,7.5c15.24,0,151.662,0,166.925,0 c4.143,0,7.5-3.358,7.5-7.5V129.547C281.067,125.594,279.709,121.717,277.242,118.628z M146.066,232.983h-31.924v-34.719 c0-9.649-7.851-17.5-17.5-17.5H64.424c-9.649,0-17.5,7.851-17.5,17.5v34.719H15V129.547c0-0.565,0.193-1.119,0.546-1.56 l63.033-78.962c1.002-1.255,2.906-1.255,3.908,0l22.183,27.789c0.001,0.001,0.001,0.002,0.002,0.002l40.85,51.172 c0.311,0.39,0.545,0.974,0.545,1.559V232.983z M157.243,118.629L120.13,72.137l18.449-23.112c1.002-1.255,2.906-1.255,3.908,0 l22.183,27.789c0.001,0.001,0.001,0.001,0.002,0.002l23.274,29.155l17.575,22.016c0,0,0,0.001,0.001,0.001 c0.352,0.441,0.546,0.995,0.546,1.559v103.437h-45V129.547C161.067,125.594,159.709,121.717,157.243,118.629z M266.067,232.983 h-45V129.547c0-3.968-1.368-7.843-3.824-10.918L180.13,72.137l18.449-23.112c1.002-1.255,2.906-1.255,3.908,0l63.033,78.962 c0,0,0,0.001,0.001,0.001c0.351,0.441,0.546,0.995,0.546,1.559V232.983z" /></svg>',
        'my_location': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="black" d="M445 4 29 195c-48 23-32 93 19 93h176v176c0 51 70 67 93 19L508 67c16-38-25-79-63-63z"/></svg>',
    },

    popupSaveHose: (
        `<div class="content-marker">
            <span class="popup">
                <button class="btn btn-add-house">
                    <svg fill="#000000" width="50px" height="50px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1524.824 1242.353c93.402 0 169.411 76.01 169.411 169.412v338.823c0 93.403-76.01 169.412-169.411 169.412H395.412C302.009 1920 226 1843.99 226 1750.588v-338.823c0-93.403 76.01-169.412 169.412-169.412ZM1016.588 0v338.824h-112.94V0h112.94ZM564.824 1468.235c62.343 0 112.94 50.71 112.94 112.941s-50.597 112.942-112.94 112.942c-62.344 0-112.942-50.71-112.942-112.942 0-62.23 50.598-112.94 112.942-112.94ZM903.647 338.824v428.385L657.322 520.885l-79.85 79.85 382.646 382.644 382.644-382.645-79.85-79.85-246.324 246.325V338.824h508.236c93.74 0 169.411 75.67 169.411 169.411v677.647c-46.306-35.011-106.164-56.47-169.411-56.47H395.412c-63.247 0-123.106 21.459-169.412 56.47V508.235c0-93.74 75.67-169.411 169.412-169.411h508.235Z" fill-rule="evenodd"></path>
                    </svg>
                    <span class="save-label">Save</span>
                </button>
                <span class="close-btn">×</span>
                <span class="spacer"></span>
            </span>
        </div>`
    ),

    popupRouting: (
        `<div class="content-marker routing-popup-content">
            <span class="popup text-center routing-items">
                <button class="btn btn-routing btn-walking">
                    <img src="${walking}">
                </button>
                <button class="btn btn-routing btn-cycling">
                    <img src="${cycling}">
                </button>
                <button class="btn btn-routing btn-car">
                    <img src="${car}">
                </button>
                <span class="close-btn">×</span>
                <span class="spacer"></span>
            </span>
        </div>`
    ),

    popupStartNavigation: (
        `<button class="btn btn-routing btn-route">
            <img src="${destination}">
        </button>`
    ),

    house_item: ( house_id, title, lat, lng ) => {
        return (
            `<div class="house" house-id="${house_id}">
                <div class="info-container d-flex align-center">
                    <svg fill="#000000" width="20px" height="100%" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M23.505 0c0.271 0 0.549 0.107 0.757 0.316 0.417 0.417 0.417 1.098 0 1.515l-14.258 14.264 14.050 14.050c0.417 0.417 0.417 1.098 0 1.515s-1.098 0.417-1.515 0l-14.807-14.807c-0.417-0.417-0.417-1.098 0-1.515l15.015-15.022c0.208-0.208 0.486-0.316 0.757-0.316z"></path></svg>
                    <div class="info">
                        <div class="title">${title}</div>
                        <div class="location">
                            <div class="lat" lat="${lat}">lat: <span>${lat}</span></div>
                            <div class="lng" lng="${lng}">lng: <span>${lng}</span></div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="btn edit">
                        <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <div class="btn save d-none">
                        <svg width="15px" height="15px" class="save-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-152.000000, -515.000000)" fill="#000000"><path d="M171,525 C171.552,525 172,524.553 172,524 L172,520 C172,519.447 171.552,519 171,519 C170.448,519 170,519.447 170,520 L170,524 C170,524.553 170.448,525 171,525 L171,525 Z M182,543 C182,544.104 181.104,545 180,545 L156,545 C154.896,545 154,544.104 154,543 L154,519 C154,517.896 154.896,517 156,517 L158,517 L158,527 C158,528.104 158.896,529 160,529 L176,529 C177.104,529 178,528.104 178,527 L178,517 L180,517 C181.104,517 182,517.896 182,519 L182,543 L182,543 Z M160,517 L176,517 L176,526 C176,526.553 175.552,527 175,527 L161,527 C160.448,527 160,526.553 160,526 L160,517 L160,517 Z M180,515 L156,515 C153.791,515 152,516.791 152,519 L152,543 C152,545.209 153.791,547 156,547 L180,547 C182.209,547 184,545.209 184,543 L184,519 C184,516.791 182.209,515 180,515 L180,515 Z" id="save-floppy" sketch:type="MSShapeGroup"></path></g></svg>
                    </div>
                    <div class="btn delete">
                        <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M6 7V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                </div>
            </div>`
        )
    },

    coord: (coord) => ({ lng: coord.x, lat: coord.y }),
}