var Utils = require('../common-styles');
var _ = require('underscore');

var seDeplacer = [ 'AutoLib', 'GaresSNCF', 'RatpStation', 'Velib' ];

var zoomLevels = Utils.getMarkerZoomLevels({
    'marker-width' : 24,
    'marker-opacity' : 1,
    'marker-line-width' : 4,
    'marker-line-opacity' : 1,
}, {
    maxZoom : 18
});

var style = Utils.extendStyle({
    'marker-fill' : '#857198',
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[zoom>=16]' : {
        '[type="Velib"]' : {
            'marker-file' : 'url(../svg/maki/bicycle-18.svg)',
            'marker-transform' : 'scale(1.2, 1.2)'
        },
        '[type="AutoLib"]' : {
            'marker-file' : 'url(../svg/maki/car-18.svg)',
            'marker-transform' : 'scale(0.8, 0.8)'
        },
        '[type="GaresSNCF"]' : {
            'marker-file' : 'url(../svg/maki/rail-18.svg)'
        }
    }
});

module.exports = {
    '#objects' : style
}