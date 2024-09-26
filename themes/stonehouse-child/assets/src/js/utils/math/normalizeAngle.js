export const normalizeAngle = (angleInDegrees) => {
    return (angleInDegrees + 360) % 360;
}