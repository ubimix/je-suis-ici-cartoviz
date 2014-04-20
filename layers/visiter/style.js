var Utils = require('../common-styles');
var _ = require('underscore');

var visiter = [ 'Monument', 'Museum', 'Hotels' ];

var maxZoom = 18;
var size = 24;
var zoomLevels = Utils.getMarkerZoomLevels({
    'marker-width' : size,
    'marker-opacity' : 1,
    'marker-line-width' : 4,
    'marker-line-opacity' : 1,
}, {
    maxZoom : maxZoom
});

var style = Utils.extendStyle({
    'marker-fill' : '#983333',
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[zoom>=16]' : {
        'marker-allow-overlap' : false,
        '[type="Hotels"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/monuments.svg)'
        },
        '[type="Monument"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/monuments.svg)',
        },
        '[type="Museum"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/musee.svg)',
        }
    }
});

module.exports = {
    '#objects' : style
}