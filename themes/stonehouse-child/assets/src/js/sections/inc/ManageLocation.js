import { crud } from '../../constants/crud'

export class ManageLocation {

    locationSaved = false

    saveLocation = {

        content: null,
        saveBtn: null, 
        closeBtn: null,

        marker: null,
        popup: null,
        point: null
    }

    constructor(defaults) {
        this.defaults = defaults
    }

    reset() {

        this.saveLocation.marker && !this.locationSaved && this.saveLocation.marker.remove()
        this.saveLocation.popup && this.saveLocation.popup.remove()
        this.saveLocation.point && this.saveLocation.point.remove()
        this.saveLocation.content && this.saveLocation.content.remove()

        this.locationSaved = false

        this.saveLocation = {

            content: null,
            saveBtn: null, 
            closeBtn: null,
    
            marker: null,
            popup: null,
            point: null
        }
    }

    handle_create_location = async ( coordinate, marker ) => {

        let reponse = {status: 'error'}

        this.saveLocation.saveBtn.classList.add('loading')

        await crud.create_location( coordinate.x, coordinate.y ).then( res => {

            res = JSON.parse(res)
            reponse = res

            if ( res.status === 'success' ) {

                this.locationSaved = true
                // console.log(res)
                marker.setSymbol(this.defaults.marker('success'))

                this.saveLocation.saveBtn.classList.remove('loading')
                this.saveLocation.saveBtn.classList.add('loaded')
            } else {

                this.saveLocation.saveBtn.classList.remove('loading')

                this.saveLocation.saveBtn.classList.add('error')
                this.saveLocation.saveBtn.querySelector('.save-label').textContent = 'Error'
                
                marker.setSymbol(this.defaults.marker('error'))
            }
        })

        return reponse
    }
}