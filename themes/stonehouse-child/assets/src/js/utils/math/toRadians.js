/**
 * Converts degrees to radians.
 *
 * @param {number} angleInDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
export const toRadians = (angleInDegrees) => {
    return (angleInDegrees * Math.PI) / 180;
}