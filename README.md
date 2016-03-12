# Ng-PageSpeed
Live url: https://godev.space/ng-ps  
##### This is the second part of my final project for CS50x2016.
A simple AngularJs application with Materialize CSS as style framework (more specs on About page).

## Build & development

If you want try yourself, you need first `nodejs 5.x`, `npm`, `bower`, `grunt`, `karma`  installed.

#### Clone and install
```sh
$ git clone https://github.com/LasaleFamine/ng-pagespeed-cs50x [optional name]
$ cd <your directory>
$ npm install
```

#### Run
```sh
$ grunt serve
```

#### Build
```sh
$ grunt
```

### Custom service
You can change also the service url and get the results from another source.  
The default value is related to my service on my own server and it may will not go really fast. Also it may be **not working** sometimes.  
Inside `/app/scripts/services/pgspeed,js`:
```js
var url = 'https://godev.space/pgspeedService/api/exp';
```
Change with:
```js
var url = [yourServiceUrl];
```

## Testing
(NOT READY)
Running `grunt test` will run the unit tests with karma.
