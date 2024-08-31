# theme-wp-webpack
 Webpack for wordpress theme with jquery

     git clone https://github.com/xXispectorXx/theme-wp-webpack.git
     mv theme-wp-webpack assets

     cd assets
     npm i
     npm audit fix

## Start building

 *dev:*
 
     npm run dev

 *prod:*
 
     npm run prod

## Add separate build file:
   *./webpack.config.js*
```js
const entry = {
    index: SRC_DIR + '/index.js',

    // Separated compilation file (for any other page added after this line you need restart webpack)
    home: PAGES_DIR + '/home.js',

    ...

};
```
<br />
<br />

     if the npm is running with webpack you need restart building script

## Add run scripts like (dev || prod):
   *./package.json*
```yaml
"main": "main.js",
"scripts": {
    "prod": "cross-env NODE_ENV=production webpack --mode production --progress",
    "dev": "cross-env NODE_ENV=development webpack --watch --mode development --progress",

    ...

},
"keywords": [
    "wordpress",
    "theme"
],
```
<br />
<br />

     on this section you can send variable to webpack file like NODE_ENV
     ex: 
          "myscript": "cross-env MY_VAR_NAME=test NODE_ENV=production webpack --watch --mode production --progress"
          the webpack script recive:

          MY_VAR_NAME=test = on => process.env.MY_VAR_NAME
          NODE_ENV=production = on => process.env.NODE_ENV
          
          --mode production = on => argv.mode

      you can use this settings to customize your webpack

<br />
<br />
<br />

# Note:
if you wont add custom css or scss from different npm library to general index script is sufficient import this file in /src/index.js or any js file in /src/js.

     remember: for any build in separate file all css or scss imports has separate build css
          ex:
          for home.js for any import css or scss in this file you can find the
          builded css => ./dist/css/home.bundle.css
          builded js => ./dist/js/home.bundle.js




