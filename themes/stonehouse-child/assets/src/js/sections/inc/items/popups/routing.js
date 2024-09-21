import walking from '../../../../../images/walking.svg'
import cycling from '../../../../../images/cycling.svg'
import car from '../../../../../images/car.svg'


export const popupRouting = () => (
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
)