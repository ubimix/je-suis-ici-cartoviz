var Utils = require('../common-styles');
var _ = require('underscore');

var vivre = [ 'Sanisette', 'Police', 'Pharmacy', 'SpotWifi',
        'EtablissementHospitalier', 'Kiosque', 'LaPoste', 'EspacePublique' ];

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
        '[type="SpotWifi"]' : {
            'marker-fill' : '#666666'
        },
        '[type="LaPoste"]' : {
            'marker-fill' : '#FFD700',
        },
        '[type="Sanisette"][zoom>=16]' : {
            'marker-fill' : '#29A5DC'
        },

        '[type="Police"]' : {
            'marker-fill' : '#866239'
        },
        '[type="EspacePublique"]' : {
            'marker-fill' : '#0063A4'
        },

        '[type="Kiosque"]' : {
            'marker-fill' : '#29A5DC'
        },

        '[type="Pharmacy"]' : {
            'marker-fill' : '#009866'
        },
        '[type="EtablissementHospitalier"]' : {
            'marker-fill' : '#009866'
        },

    },
    '[zoom>=16]' : {
        'marker-allow-overlap' : false,
        'marker-file' : 'url(../svg/awsome/dot-circle-o.svg)',
        '[type="SpotWifi"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/wifi.svg)',
        },
        '[type="LaPoste"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/poste.svg)',
        },
        '[type="Sanisette"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/sanisette.svg)',
        },

        '[type="Police"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/police.svg)',
        },
        '[type="EspacePublique"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/municipal.svg)'
        },

        '[type="Kiosque"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/kiosque.svg)',
        },

        '[type="Pharmacy"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/pharmacie.svg)'
        },
        '[type="EtablissementHospitalier"]' : {
            'marker-file' : 'url(../svg/icone-2-avec/hopital.svg)'
        }
    }
});

module.exports = {
    '#objects' : style,
}
