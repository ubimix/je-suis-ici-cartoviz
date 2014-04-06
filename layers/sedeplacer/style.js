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
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[zoom>=16]' : {
        '[type="Velib"]' : {
            'marker-file' : 'url(../svg/icones-pastille/velib-pastille.svg)'
        },
        '[type="AutoLib"]' : {
            'marker-file' : 'url(../svg/icones-pastille/autolib-pastille.svg)'
        },
        '[type="GaresSNCF"]' : {
            'marker-file' : 'url(../svg/maki/rail-18.svg)'
        }
    }
});

module.exports = {
    '#objects' : style
}