/**
 * The `regressionLine` function calculates the slope and intercept of a linear regression line based
 * on a set of input points.
 * @param points_coordinate - The `points_coordinate` parameter is an array of coordinate pairs
 * representing points on a 2D plane. Each element in the array is an array itself, containing two
 * values: the x-coordinate and the y-coordinate of a point. For example, `[[x1, y1], [x2
 * @returns The `regressionLine` function returns an object with two properties: `m` and `b`. The `m`
 * property represents the slope of the regression line, while the `b` property represents the
 * y-intercept of the regression line.
 */
export const regressionLine = (points_coordinate) => {
    
    const n = points_coordinate.length

    // Sums needed to calculate m and b
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumX2 = 0

    // Calculate the sums
    for (let i = 0; i < n; i++) {
        const x = points_coordinate[i][0]
        const y = points_coordinate[i][1]

        sumX += x
        sumY += y
        sumXY += x * y
        sumX2 += x * x
    }

    // Calculate the slope m and the intercept b
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    return {
        m: m,
        b: (sumY - m * sumX) / n
    }
}