export class Location {

    content = null

    popup = null
    save = null 
    close = null

    marker = null
    point = null

    constructor() {}

    setContent( content ) {

        this.content = content

        this.save = this.content.querySelector('.btn-add-house')
        this.close = this.content.querySelector('.close-btn')
    }
}