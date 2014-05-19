var _ = require('underscore');

function getHash(buf) {
    return require('crypto').createHash('sha1').update(buf).digest('hex')
}

module.exports = {

    _getMask : function(params) {
        if (!params)
            return undefined;
        var val = params.q;
        return val && val != '' ? val : undefined;
    },

    getId : function(params) {
        var mask = this._getMask(params);
        if (!mask)
            return null;
        return getHash(mask);
    },
    prepareDatasource : function(args) {
        var dataLayer = args.dataLayer;
        var config = args.config;
        var mask = this._getMask(args.params);
        if (mask) {
            var query = dataLayer.Datasource.table;
            query = query.replace('from objects_webmercator',
                    " from objects_webmercator "
                            + "where  properties->>'description' like '%"
                            + mask + "%'");
            dataLayer.Datasource.table = query;
        }
    }

}