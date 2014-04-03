var _ = require('underscore');
var Utils = require('./transform-utils');
var Q = require('q');
var Geocoder = require('geocoder');
var FS = require('fs');

var exported = module.exports = [];

var dataFile = '../data/commerces.json';
var targetFile = '../data/commerces-geocoded.json';

Q().then(function() {
    return Q.ninvoke(FS, 'readFile', dataFile, 'UTF-8').then(function(str) {
        return JSON.parse(str);
    });
}).then(function(array) {
    var promise = Q();
    _.each(array, function(obj) {
        promise = promise.then(function() {
            return doGeocode(obj).then(function() {
                console.log(obj.geometry);
                return obj;
            });
        })
    })
    return promise.then(function() {
        return array;
    });
}).then(function(array) {
    var str = JSON.stringify(array, null, 2);
    return Q.ninvoke(FS, 'writeFile', targetFile, str, 'UTF-8');
}).fail(function(err) {
    console.log(err.stack);
}).done();

function doGeocode(obj) {
    return Q().then(function() {
        var item = obj.properties;
        var rue = item.adresse_rue;
        var ville = item.adresse_ville;
        var codePostal = item.adresse_code_postal;
        var addr = rue + ' ' + ville + ' ' + codePostal;
        console.log('Start geocoding "' + addr + '"...')
        return Q.ninvoke(Geocoder, 'geocode', addr).then(function(geoData) {
            console.log('Done.');
            var geom = geoData.results[0];
            if (geom && geom.geometry && geom.geometry.location) {
                var lat = geom.geometry.location.lat;
                var lng = geom.geometry.location.lng;
                obj.geometry = {
                    type : 'Point',
                    coordinates : [ lng, lat ]
                };
            }
            return Q.delay(500).then(function() {
                return obj;
            });
        });
    });
}
