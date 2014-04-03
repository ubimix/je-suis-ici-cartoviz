var _ = require('underscore');
var Utils = require('./transform-utils');

var exported = module.exports = [];

// 25 - La carte des hôtels classés en Île-de-France
exported.push(CciConfig());

/* ------------------------------------------------------------ */

function CciConfig() {
    return Utils.newDataSet({
        "path" : "commerces.csv",
        "url" : "",
        csvOptions : {
            delim : ','
        },
        transform : function(item) {
            var that = this;
            var result = {
                type : 'Feature',
                properties : _.extend({
                    type : 'Commerce'
                }, that._toProperties(item, {}))
            };
            return result;
        }
    });
}

/* ------------------------------------------------------------ */

