import { crud } from '../../constants/crud'
import { Location } from './elements/Location'


export class ManageLocation extends Location {


    locationSaved = false


    constructor({ map, cluster, markerTemplate }) {

        super()

        this.map = map
        this.cluster = cluster

        this.markerTemplate = markerTemplate
    }


    reset() {

        this.marker && !this.locationSaved && this.marker.remove()
        this.popup && this.popup.remove()
        this.point && this.point.remove()
        this.content && this.content.remove()

        this.locationSaved = false

        this.content = null
        this.popup = null
        this.save = null 
        this.close = null
        this.marker = null,
        this.point = null
    }


    handle_create_location = async ( coordinate, marker ) => {

        let reponse = {status: 'error'}

        this.save.classList.add('loading')

        await crud.create_location( coordinate.x, coordinate.y ).then( res => {

            res = JSON.parse(res)
            reponse = res

            if ( res.status === 'success' ) {

                this.locationSaved = true
                // console.log(res)
                marker.setSymbol(this.markerTemplate('success'))

                this.save.classList.remove('loading')
                this.save.classList.add('loaded')
            } else {

                this.save.classList.remove('loading')

                this.save.classList.add('error')
                this.save.querySelector('.save-label').textContent = 'Error'
                
                marker.setSymbol(this.markerTemplate('error'))
            }
        })

        return reponse
    }



    focusLocationMarker( itemCoord, markerCoord ) {

        const lat_length = itemCoord.lat.toString().split(".")[1].length
        const lng_length = itemCoord.lng.toString().split(".")[1].length

        if (
            itemCoord.lat === parseFloat(markerCoord.x.toFixed(lat_length)) &&
            itemCoord.lng === parseFloat(markerCoord.y.toFixed(lng_length))
        ) {
            
            this.map.animateTo({
                center: markerCoord,
                zoom: 13,
            }, {
                duration: 800
            })
        }
    }


    listenHoverItemMarker( item ) {

        const itemCoord = {
            lat: parseFloat( item.querySelector('.location .lat').getAttribute('lat') ),
            lng: parseFloat( item.querySelector('.location .lng').getAttribute('lng') ),
        }

        item.addEventListener('mouseenter', ev => 

            this.cluster.forEach( async marker => 
                this.focusLocationMarker( itemCoord, marker.getCoordinates() )
            )
        )
    }



    
}