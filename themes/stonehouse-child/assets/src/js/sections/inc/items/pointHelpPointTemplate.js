export const pointHelpPointTemplate = (type = 'default') => {

    const color = (
        type == 'default'
            ? "rgba(110, 204, 57, 0.6)"
            : (
                type == 'success'
                ? "rgba(110, 204, 57, 0.6)"
                : "rgba(110, 204, 57, 0.6)"
            )
    )

    return {
        'markerType': 'path',
        'markerPath': [
            {
                path: "M 0 200 C 0 89.543 89.544 0 200 0 C 310.457 0 400 89.543 400 200 C 400 310.457 310.457 400 200 400 C 89.544 400 0 310.457 0 200 Z",
                fill: color,
            }, {
                path: "M 50 200 C 50 117.157 117.158 50 200 50 C 282.843 50 350 117.157 350 200 C 350 282.843 282.843 350 200 350 C 117.158 350 50 282.843 50 200 Z",
                fill: color
            }
        ],
        'markerHorizontalAlignment': 'middle',
        'markerVerticalAlignment': 'middle',
        'markerPathWidth': 400,
        'markerPathHeight': 400,
        'markerWidth': 50,
        'markerHeight': 50,
    }
}