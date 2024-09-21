export class Location {

    content = null

    popup = null
    save = null 
    close = null

    marker = null
    point = null

    constructor() {}

    getSave() {
        return this.content.querySelector('.btn-add-house')
    }

    getClose() {
        return this.content.querySelector('.close-btn')
    }
}