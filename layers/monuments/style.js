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
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels, {
    '[type="monument"]' : {
        'marker-transform' : 'scale(0.7, 0.7)'
    },
    '[type="museum"]' : {
        'marker-transform' : 'scale(1.5, 1.5)'
    },

    '[zoom<16]' : {
        'marker-fill' : '#983333'
    },
    '[zoom>=16]' : {
        '[type="monument"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/monuments.svg)',
        },
        '[type="museum"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/musee.svg)',
        }
    }
});

module.exports = {
    '#objects' : style
}