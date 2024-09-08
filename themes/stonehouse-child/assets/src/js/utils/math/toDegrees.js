/**
 * Converts radians to to degrees.
 *
 * @param {number} angleInRadians Angle in radians.
 * @return {number} Angle in degrees.
 */
export const toDegrees = (angleInRadians) => {
    return (angleInRadians * 180) / Math.PI;
}