import { crud } from '../../constants/crud'
import { Location } from './elements/Location'
import { popupRouting } from './items/popups/routing'
import { popupSaveHose } from './items/popups/saveHose'
import { pointMarker } from './items/pointMarker'
import { houseItem } from './items/houseItem'


export class ManageLocations extends Location {


    locationSaved = false


    constructor({ UX, mapBox, Coordinate, markerTemplate, coord, createElementFromHTML }) {

        super()

        this.details = document.querySelector('.details')

        this.UX = UX
        this.mapBox = mapBox

        this.Coordinate = Coordinate

        this.markerTemplate = markerTemplate
        this.coord = coord
        this.createElementFromHTML = createElementFromHTML

        this.initSavedLocations(stonehouse_data)
        this.fixEmptyHouses(stonehouse_data.locations)
    }


    /**
     * The `initSavedLocations` function initializes saved locations by adding markers for each house
     * location and setting up event listeners.
     * @param houses - The `houses` parameter seems to be an object containing locations of houses. The
     * `initSavedLocations` function initializes saved locations on a map by adding markers for each
     * house location provided in the `houses` object.
     */
    initSavedLocations(houses) {

        const addSavedMarker = (item) => {

            const {lat, lng} = item.location
            const coord = new this.Coordinate([lat, lng])

            const marker = this.UX.setMarker(coord, 'success')
            marker.on('click', ev => this.clickSavedMarker(ev))
            marker.addTo(this.UX.cluster)
        }

        Object.values(houses.locations).forEach( async item => addSavedMarker(item) )

        this.savedLocationsListeners()
    }


    /**
     * The function `fixEmptyHouses` checks if the `locations` array is empty and adds or removes the
     * 'disabled' class from a menu item accordingly.
     * @param locations - It looks like the `fixEmptyHouses` function is designed to handle the
     * visibility of a menu item based on the presence of locations. If the `locations` array is empty,
     * the function adds a 'disabled' class to the menu item, otherwise it removes the 'disabled'
     * class.
     */
    fixEmptyHouses(locations) {

        let menuDom = this.UX.menu.getDOM()
        const li = menuDom.querySelector('#houses-svg-icon').closest('li')

        if ( ! locations.length )
            li.classList.add('disabled')

        else
            li.classList.remove('disabled')
    }


    /**
     * The `reset` function in JavaScript removes markers, popups, points, and content while resetting
     * location status flags.
     */
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


    /* The `handleCreateLocation` function is an asynchronous arrow function that takes in two
    parameters: `coordinate` and `marker`. Here's a breakdown of what it does: */
    handleCreateLocation = async ( coordinate, marker ) => {

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


    /**
     * The function `focusLocationMarker` compares the coordinates of an item and a marker, and
     * animates the map to focus on the marker if they match.
     * @param itemCoord - The `itemCoord` parameter represents the coordinates of an item, typically in
     * the format `{ lat: number, lng: number }`. These coordinates are used to determine if the map
     * should be focused on a specific location marker.
     * @param markerCoord - MarkerCoord is an object that contains the coordinates of a marker on a
     * map. It typically has two properties: x for the latitude and y for the longitude.
     */
    focusLocationMarker( itemCoord, markerCoord ) {

        const lat_length = itemCoord.lat.toString().split(".")[1].length
        const lng_length = itemCoord.lng.toString().split(".")[1].length

        if (
            itemCoord.lat === parseFloat(markerCoord.x.toFixed(lat_length)) &&
            itemCoord.lng === parseFloat(markerCoord.y.toFixed(lng_length))
        ) {
            
            this.UX.map.animateTo({
                center: markerCoord,
                zoom: 13,
            }, {
                duration: 800
            })
        }
    }


    /**
     * The function `listenHoverItemMarker` listens for mouseenter events on a specified item and then
     * focuses on location markers within a cluster based on the item's coordinates.
     * @param item - The `item` parameter in the `listenHoverItemMarker` function is a reference to an
     * HTML element that represents a location item.
     */
    listenHoverItemMarker( item ) {

        const itemCoord = {
            lat: parseFloat( item.querySelector('.location .lat').getAttribute('lat') ),
            lng: parseFloat( item.querySelector('.location .lng').getAttribute('lng') ),
        }

        item.addEventListener('mouseenter', ev => 

            this.UX.cluster.forEach( async marker => 
                this.focusLocationMarker( itemCoord, marker.getCoordinates() )
            )
        )
    }


    /**
     * The function `savedLocationsListeners` adds hover event listeners to elements with the class
     * `.house` within the `details` element.
     */
    savedLocationsListeners() {

        const locations = this.details.querySelectorAll('.house')

        locations.forEach( item => this.listenHoverItemMarker( item ) )
    }


    /**
     * The `clickSavedMarker` function handles the click event on a saved marker, displaying a popup
     * with routing options for walking, cycling, and driving.
     * @param ev - The `ev` parameter in the `clickSavedMarker` function likely refers to the event
     * object that is passed when the function is triggered by a click event. This event object
     * contains information about the event that occurred, such as the target element that was clicked.
     */
    clickSavedMarker(ev) {

        this.mapBox.popup && this.mapBox.popup.remove()

        const marker = ev.target
        const coord = marker.getCoordinates()
        const destination = this.coord(coord)

        const content = this.createElementFromHTML( popupRouting() )

        const btnWalking = content.querySelector('.btn-walking')
        const btnCycling = content.querySelector('.btn-cycling')
        const btnCar = content.querySelector('.btn-car')

        btnWalking.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/walking' ), false)
        btnCycling.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/cycling' ), false)
        btnCar.addEventListener('click', ev => this.mapBox.buildRoutingPath( destination, 'mapbox/driving-traffic' ), false)

        const close = content.querySelector('.close-btn')
        this.mapBox.popup = this.UX.setHtmlMarker( coord, content )

        close.addEventListener('click', ev => this.mapBox.popup.remove(), false)

        this.mapBox.popup.addTo(this.UX.map).show()
    }


    /**
     * The function `saveLocationMenuItem` adds a marker to a map cluster and appends details of a
     * saved location if the response status is successful.
     * @param marker - Marker is an object representing a specific location on a map. It typically
     * includes information such as the latitude and longitude coordinates, title, and other properties
     * related to the location. In the context of the `saveLocationMenuItem` function, the marker
     * parameter is used to add a marker to a cluster on the
     * @param response - The `response` parameter in the `saveLocationMenuItem` function likely
     * contains information returned from a server request or API call. It seems to have a `status`
     * property that indicates the status of the response (e.g., 'success') and a `message` property
     * that contains details such as an
     */
    saveLocationMenuItem(marker, response) {

        if ( this.locationSaved ) {

            if ( response.status === 'success' ) {

                const item = this.createElementFromHTML(
                    houseItem(
                        response.message.id,
                        response.message.title,
                        response.message.location.lat,
                        response.message.location.lng
                    )
                )

                this.listenHoverItemMarker( item )
                marker.addTo(this.UX.cluster)
                marker.on('click', ev => this.clickSavedMarker(ev))
                this.details.append(item)
            }

            this.fixEmptyHouses([true])
        }
    }


    /**
     * The `saveMarker` function sets up a marker on a map with a popup and point marker at a specific
     * coordinate, allowing the user to save the location.
     * @param coordinate - The `coordinate` parameter in the `saveMarker` function is typically an
     * object that represents the geographical coordinates of a location. It usually contains latitude
     * and longitude values that specify a point on the Earth's surface. For example, a coordinate
     * object could look like this:
     */
    saveMarker(coordinate) {

        this.reset()

        const content = this.createElementFromHTML( popupSaveHose() )

        this.setContent( content )

        this.marker = this.UX.setMarker(coordinate)
        this.popup = this.UX.setHtmlMarker(coordinate, content)
        this.point = this.UX.setHtmlMarker(coordinate, pointMarker(), 'middle')

        this.save.addEventListener('click', async ev => this.saveLocationMenuItem(
            this.marker,
            await this.handleCreateLocation( coordinate, this.marker )
        ), false)

        this.close.addEventListener('click', ev => this.reset(), false)

        this.marker.addTo(this.UX.cluster)
        this.popup.addTo(this.UX.map).show()
        this.point.addTo(this.UX.map).show()
    }
}