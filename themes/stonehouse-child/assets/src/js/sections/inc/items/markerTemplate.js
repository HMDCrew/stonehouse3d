export const markerTemplate = (type = 'default') => {

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
}