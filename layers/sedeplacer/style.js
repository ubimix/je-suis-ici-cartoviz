var Utils = require('../common-styles');
var _ = require('underscore');

var seDeplacer = [ 'AutoLib', 'GaresSNCF', 'RatpStation', 'Velib' ];

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
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[zoom<16]' : {
        '[type="Velib"]' : {
            'marker-fill' : '#653A80'
        },
        '[type="AutoLib"]' : {
            'marker-fill' : '#009ADC'
        },
        '[type="GaresSNCF"]' : {
            'marker-fill' : '#983333'
        }
    },
    '[zoom>=16]' : {
        '[type="Velib"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/velib.svg)',
            'marker-file' : 'url(../svg/icones-pastille/velib-pastille.svg)'
        },
        '[type="AutoLib"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/autolib.svg)',
            'marker-file' : 'url(../svg/icones-pastille/autolib-pastille.svg)'
        },
        '[type="GaresSNCF"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/gare.svg)'
        }
    },
});

module.exports = {
    '#objects' : style,
}