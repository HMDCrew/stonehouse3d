new Promise( async (resolve) => {

    const response = await fetch('https://ip-geo-location.p.rapidapi.com/ip/check?format=json&language=en', {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.IP_LOCATION,
            'x-rapidapi-host': 'ip-geo-location.p.rapidapi.com'
        }
    })

    resolve( response.json() )

})
// .then( val => new MaptalksUX( val.location ) )
.then( val =>
    import(/* webpackPreload: true */ "./maptalks_ux").then(
        module => {
            new module.MaptalksUX( val.location )
        }
    )
)