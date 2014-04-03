var Utils = require('../common-styles');
var _ = require('underscore');

var visiter = [ 'Monument', 'Museum', 'Hotels' ];

var zoomLevels = Utils.getMarkerZoomLevels({
    'marker-width' : 24,
    'marker-opacity' : 1,
    'marker-line-width' : 4,
    'marker-line-opacity' : 1,
}, {
    maxZoom : 18
});

var style = Utils.extendStyle({
    'marker-fill' : '#f4b04f',
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[zoom>=16]' : {
        'marker-allow-overlap' : false,
        '[type="Hotels"]' : {
            'marker-file' : 'url(../svg/maki/building-18.svg)'
        },
        '[type="Monument"]' : {
            'marker-file' : 'url(../svg/maki/monument-18.svg)'
        },
        '[type="Museum"]' : {
            'marker-file' : 'url(../svg/maki/museum-18.svg)'
        }
    }
});

module.exports = {
    '#autolib' : style
}