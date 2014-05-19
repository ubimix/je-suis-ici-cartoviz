var _ = require('underscore');
var config = require('./tilepin.config.json');
var dbConfig = config.db;
module.exports = _.extend(config, {
    db : function(options) {
        var dataLayer = options.dataLayer;
        var sourceKey = options.params.source;
        _.defaults(dataLayer.Datasource, dbConfig[sourceKey], dbConfig['*']);
    }
});