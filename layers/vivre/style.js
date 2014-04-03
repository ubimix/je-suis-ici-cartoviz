var Utils = require('../common-styles');
var _ = require('underscore');

var vivre = [ 'Sanisette', 'Police', 'Pharmacy', 'SpotWifi',
        'EtablissementHospitalier', 'Kiosque', 'LaPoste', 'EspacePublique' ];

var zoomLevels = Utils.getMarkerZoomLevels({
    'marker-width' : 24,
    'marker-opacity' : 0.8,
    'marker-line-width' : 4,
    'marker-line-opacity' : 1,
}, {
    maxZoom : 18
});

var style = _.extend({
    'marker-fill' : '#e66454',
    'marker-line-color' : 'white',
    'marker-placement' : 'point',
    'marker-type' : 'ellipse',
    'marker-allow-overlap' : true,
}, zoomLevels);

module.exports = {
    '#autolib' : style
}