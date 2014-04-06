var Utils = require('../common-styles');
var _ = require('underscore');

var vivre = [ 'Sanisette', 'Police', 'Pharmacy', 'SpotWifi',
        'EtablissementHospitalier', 'Kiosque', 'LaPoste', 'EspacePublique' ];

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
    // '[zoom>=16]' : {
    'marker-allow-overlap' : false,
    'marker-file' : 'url(../svg/awsome/dot-circle-o.svg)',
    '[type="Pharmacy"]' : {
        'marker-file' : 'url(../svg/icones-pastille/pharmacie.svg)'
    },
    '[type="SpotWifi"]' : {
        'marker-file' : 'url(../svg/awsome/rss.svg)',
        'marker-transform' : 'scale(0.7, 0.7)'
    },
    '[type="LaPoste"]' : {
        // 'marker-file' : 'url(../svg/laposte.svg)',
        'marker-file' : 'url(../svg/maki/post-18.svg)',
        'marker-file' : 'url(../svg/icones-pastille/laposte.svg)',
    },
    '[type="Sanisette"]' : {
        'marker-file' : 'url(../svg/maki/toilets-18.svg)',
        'marker-file' : 'url(../svg/icones-pastille/toilettes.svg)',
    },
    '[type="Police"]' : {
        'marker-file' : 'url(../svg/maki/police-18.svg)',
    },
    '[type="EspacePublique"]' : {
        'marker-file' : 'url(../svg/icones-pastille/municipal.svg)'
    },
    '[type="Kiosque"]' : {
        'marker-file' : 'url(../svg/maki/library-18.svg)',
        'marker-file' : 'url(../svg/icones-pastille/kiosque.svg)',
    },
    '[type="EtablissementHospitalier"]' : {
        'marker-file' : 'url(../svg/awsome/h-square.svg)',
        'marker-file' : 'url(../svg/icones-pastille/hopital.svg)',
    }
// }
});

module.exports = {
    '#objects' : style,
}