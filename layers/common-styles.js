var _ = require('underscore');

function opacity(value) {
    return Math.max(0, Math.min(value, 1));
}
function width(value) {
    if (value < 1 / 10)
        return 0;
    return value;
}

var Utils = {
    extendStyle : function() {
        var result = {};
        _.each(arguments, function(style) {
            _.each(style, function(value, key) {
                var oldValue = result[key];
                if (_.isObject(oldValue) && _.isObject(value)) {
                    _.extend(oldValue, value);
                } else {
                    result[key] = value;
                }
            })
        })
        return result;
    },

    getMarkerZoomLevels : function(options, params) {
        params = params || {};
        var maxZoom = params.maxZoom || 18;
        var mw = options['marker-width'] || 0;
        var mo = options['marker-opacity'] || 0;
        var lw = options['marker-line-width'] || 0;
        var lo = options['marker-line-opacity'] || 0;
        var opacityReduction = [ 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4 ];
        var widthReduction = [ 1, 1 / 2, 1 / 3, 1 / 5, 1 / 8, 1 / 13, 1 / 21 ];
        var result = {
            'marker-width' : 0,
            'marker-opacity' : 0,
            'marker-line-width' : 0,
            'marker-line-opacity' : 0
        }
        for (var i = opacityReduction.length - 1; i >= 0; i--) {
            var key = '[zoom>=' + (maxZoom - i) + ']'
            var o = opacityReduction[i];
            var w = widthReduction[i];
            result[key] = {
                'marker-opacity' : opacity(mo * o),
                'marker-width' : width(mw * w),
                'marker-line-opacity' : opacity(lo * o),
                'marker-line-width' : width(lw * w),
            }
        }
        return result;
    },

    getMarkerShadow : function(params) {
        params = _.extend({}, {
            maxZoom : 18,
            minZoom : 16,
            color : 'white',
            width : 24,
            opacity : 0.5
        }, params);
        var result = Utils.getMarkerZoomLevels({
            'marker-width' : params.width,
            'marker-opacity' : params.opacity,
            'marker-line-width' : 0,
            'marker-line-opacity' : 0,
        }, {
            maxZoom : params.maxZoom
        });
        result = Utils.extendStyle(result, {
            'marker-placement' : 'point',
            'marker-type' : 'ellipse',
            'marker-allow-overlap' : true,
            'marker-fill' : params.color,
        });
        result['[zoom<' + params.minZoom + ']'] = {
            'marker-opacity' : 0
        }
        return result;
    }

}

module.exports = Utils;