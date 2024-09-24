// ELipse to Path in svg
// function getD(cx, cy, rx, ry) {
//     var kappa=0.5522847498;
//     var ox = rx * kappa; // x offset for the control point
//     var oy = ry * kappa; // y offset for the control point 
//     let d = `M${cx - rx},${cy}`;
//         d+= `C${cx - rx}, ${cy - oy}, ${cx - ox}, ${cy - ry}, ${cx}, ${cy - ry},`
//         d+= `C${cx + ox}, ${cy - ry}, ${cx + rx}, ${cy - oy}, ${cx + rx}, ${cy},`
//         d+= `C${cx + rx}, ${cy + oy}, ${cx + ox}, ${cy + ry}, ${cx}, ${cy + ry},`
//         d+= `C${cx - ox}, ${cy + ry}, ${cx - rx}, ${cy + oy}, ${cx - rx}, ${cy},`
//         d+= `z`;
//    return d;
// }

export const pointHelpPoint = () => (
    `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <ellipse style="fill: rgba(110, 204, 57, 0.6)" cx="200" cy="200" rx="200" ry="200"></ellipse>
        <ellipse style="fill: rgba(110, 204, 57, 0.6);" cx="200" cy="200" rx="150" ry="150"></ellipse>
    </svg>`
)
