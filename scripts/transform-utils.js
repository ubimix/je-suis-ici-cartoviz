var _ = require('underscore');

module.exports = {
    isEmpty : isEmpty,
    newDataSet : newDataSet
}

function isEmpty(str) {
    return !str || str == '';
}
function newDataSet(dataset) {
    return _.extend(
            {
                delim : ";",
                transform : function(obj) {
                    return this._transform(obj);
                },
                _toGeometry : function(str) {
                    var result = null;
                    try {
                        result = JSON.parse(str);
                    } catch (e) {
                    }
                    return result;
                },
                _toGeometryPoint : function(str) {
                    if (isEmpty(str))
                        return undefined;
                    var array = str.split(/\s*,\s*/gim);
                    try {
                        return {
                            type : 'Point',
                            coordinates : [ parseFloat(array[1]),
                                    parseFloat(array[0]) ]
                        };
                    } catch (e) {
                        return undefined;
                    }
                },
                _toGeometryPointFromCoords : function(obj, latField, lonField) {
                    try {
                        return {
                            type : 'Point',
                            coordinates : [ parseFloat(obj[lonField]),
                                    parseFloat(obj[latField]) ]
                        }
                    } catch (e) {
                        return undefined;
                    }
                },
                _transformValue : function(value, type) {
                    var methodName = '_to' + type[0].toUpperCase()
                            + type.substring(1);
                    if (_.isFunction(this[methodName])) {
                        value = this[methodName](value);
                    }
                    return value;
                },
                _toProperties : function(obj, config) {
                    config = config || {};
                    var excludedKeys = {};
                    _.each(_.toArray(config.exclude), function(key) {
                        excludedKeys[key.toLowerCase()] = key;
                    })
                    var convert = config.convert || {};
                    var dataTypes = config.dataTypes || {};
                    var result = {};
                    _.each(obj, function(val, key) {
                        if (key.toLowerCase() in excludedKeys)
                            return;
                        if (key in dataTypes) {
                            val = this._transformValue(val, dataTypes[key]);
                        }
                        key = convert[key] || key;
                        if (!isEmpty(key) && !isEmpty(val)) {
                            result[key] = val;
                        }
                    }, this);
                    return result;
                },

                _toTelephone : function(value) {
                    if (isEmpty(value))
                        return undefined;
                    value = value.replace(/\s+/gim, '');
                    value = value.replace(/\./gim, '');
                    return value;
                },
                _toUrl : function(value) {
                    if (isEmpty(value))
                        return undefined;
                    value = value.replace(/\s+/gim, '');
                    if (!value.match(/^https?:\/\//gim)) {
                        value = 'http://' + value;
                    }
                    return value;
                },
                _toEmail : function(value) {
                    if (isEmpty(value))
                        return undefined;
                    if (!value.match(/^mailto:/)) {
                        value = 'mailto:' + value;
                    }
                    return value;
                },
                _toBoolean : function(value) {
                    if (isEmpty(value))
                        return undefined;
                    value = ('' + value).toLowerCase();
                    return value == '1' || value == 'yes' || value == 'oui'
                            || value == 'true';
                },
                _toInteger : function(value) {
                    if (isEmpty(value) && value !== 0)
                        return undefined;
                    try {
                        return parseInt(value);
                    } catch (e) {
                    }
                    return undefined;
                },
            }, dataset);
}
