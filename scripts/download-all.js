var _ = require('underscore');
var Q = require('q');
var Utils = require('./fetch-utils');
var Path = require('path');
var FS = require('fs');
var Url = require('url');
var PostGisUtils = require('./postgis-utils');

var dataFolder = '../data';
var datasets = require('./datasets.js')
var rebuildDb = false;

function Listener(options) {
    this.initialize(options);
}
_.extend(Listener.prototype, {
    initialize : function(options) {
        this.options = options || {};
    },
    onBegin : function(datasets) {
        return Q();
    },
    onEnd : function(datasets) {
        return Q();
    },
    onBeginDataset : function(dataset) {
        return Q();
    },
    onEndDataset : function(dataset) {
        return Q();
    },
    onDatasetEntity : function(dataset, entity) {
        return Q();
    },

    _transformToGeoJson : function(dataset, obj) {
        if (_.isFunction(dataset.transform)) {
            return dataset.transform(obj);
        }
        return obj;
    }

})
_.extend(Listener, {
    extend : function(options) {
        function F() {
            F.Parent.apply(this, arguments);
        }
        F.Parent = this;
        _.extend(F, this);
        _.extend(F.prototype, this.prototype, options);
        return F;
    }
})

var WriteListener = Listener.extend({
    initialize : function(options) {
        this.options = options || {};
        this.index = {};
    },
    onBeginDataset : function(dataset) {
        var info = {
            counter : 0
        };
        info.fileName = Path.join(this.options.dataFolder, dataset.path);
        info.destFile = this._setExtension(info.fileName, '.json');
        info.output = FS.createWriteStream(info.destFile, {
            flags : 'w',
            encoding : 'UTF-8'
        });
        this.index[dataset.path] = info;
        return Q.ninvoke(info.output, 'write', '[\n', 'UTF-8');
    },
    onEndDataset : function(dataset) {
        var info = this.index[dataset.path];
        delete this.index[dataset.path];
        return Q.ninvoke(info.output, 'end', ']', 'UTF-8');
    },
    onDatasetEntity : function(dataset, entity) {
        var info = this.index[dataset.path];
        var obj = this._transformToGeoJson(dataset, entity);
        var str = JSON.stringify(obj, null, 2);
        return Q.ninvoke(info.output, 'write', str, 'UTF-8');
    },
    _setExtension : function(fileName, newExt) {
        return Path.join(Path.dirname(fileName), Path.basename(fileName, Path
                .extname(fileName))
                + newExt);
    },

});

var DbWriteListener = Listener.extend({
    initialize : function(options) {
        this.options = options || {};
        this.index = {};
    },
    onBegin : function() {
        var that = this;
        return PostGisUtils.newConnection(that.options).then(
                function(client) {
                    that.client = client;
                    var promise;
                    if (that.options.rebuildDb) {
                        var initSql = PostGisUtils
                                .generateTableCreationSQL(that.options);
                        promise = PostGisUtils.runQuery(that.client, initSql);
                    } else {
                        promise = Q();
                    }
                    return promise.then(function() {
                        return client;
                    });
                });
    },
    onEnd : function() {
        var that = this;
        return Q().then(
                function(result) {
                    var promise = Q();
                    if (that.options.rebuildDb) {
                        var indexesSql = PostGisUtils
                                .generateTableIndexesSQL(that.options);
                        var viewsSql = PostGisUtils
                                .generateTableViewsSQL(that.options);
                        promise = PostGisUtils.runQuery(that.client,
                                indexesSql, viewsSql);
                    }
                    return promise.then(function() {
                        return result;
                    })
                }) // 
        .fin(function() {
            if (that.client) {
                that.client.end();
                delete that.client;
            }
        });
    },
    onDatasetEntity : function(dataset, entity) {
        this._counter = this._counter || 0;
        this._counter++;
        var obj = this._transformToGeoJson(dataset, entity);
        var sql = PostGisUtils.toPostGisSql(obj, this.options);
        return PostGisUtils.runQuery(this.client, sql);
    },
})

var LogListener = Listener.extend({
    initialize : function(options) {
        this.listener = options.listener;
        this.index = {};
    },
    onBegin : function(datasets) {
        console.log('Begin');
        return this.listener.onBegin(datasets);
    },
    onEnd : function(datasets) {
        return this.listener.onEnd(datasets).fin(function() {
            console.log('End');
        });
    },
    onBeginDataset : function(dataset) {
        var info = this.index[dataset.path] = {
            counter : 0
        };
        console.log('Begin [' + dataset.path + ']');
        return this.listener.onBeginDataset(dataset);
    },
    onEndDataset : function(dataset) {
        var info = this.index[dataset.path];
        delete this.index[dataset.path];
        return this.listener.onEndDataset(dataset).then(
                function() {
                    console.log('End [' + dataset.path + '] - ' + info.counter
                            + ' records.');
                });
    },
    onDatasetEntity : function(dataset, entity) {
        var info = this.index[dataset.path];
        info.counter++;
        if ((info.counter % 1000) == 0) {
            console.log(' * [' + dataset.path + '] : ' + info.counter);
        }
        return this.listener.onDatasetEntity(dataset, entity);
    },

})

function handleAll(dataFolder, dataSets, listener) {
    return listener.onBegin(dataSets).then(function() {
        return downloadAll(dataFolder, dataSets).then(function() {
            return Q.all(_.map(datasets, function(dataset) {
                return listener.onBeginDataset(dataset).then(function() {
                    var fileName = Path.join(dataFolder, dataset.path);
                    var csvOptions = dataset.csvOptions || {};
                    var list = [];
                    return Utils.readCsv(fileName, function(obj) {
                        list.push(listener.onDatasetEntity(dataset, obj));
                    }, csvOptions).then(function() {
                        return Q.all(list);
                    });
                }).fin(function() {
                    return listener.onEndDataset(dataset);
                })
            }));
        });
    }).fin(function(result) {
        return listener.onEnd(dataSets);
    });
}

var listener = new WriteListener({
    dataFolder : dataFolder
});
var listener = new DbWriteListener({
    dbname : 'je_suis_ici',
    table : 'objects',
    rebuildDb : rebuildDb
});

listener = new LogListener({
    listener : listener
});
return handleAll(dataFolder, datasets, listener).fail(function(err) {
    console.log(err.stack);
}).done();

function isEmpty(str) {
    return !str || str == '';
}

function downloadAll(baseDir, datasets, force) {
    return Q.all(_.map(datasets, function(dataset) {
        var url = dataset.url;
        if (!url) {
            return Q(false);
        }
        var fileName = Path.join(baseDir, dataset.path);
        console.log('Downloading "' + url + '" to "' + fileName + '"...')
        if (FS.existsSync(fileName) && !force) {
            console.log('Done. File "' + fileName + '" already exists.');
            return Q(true);
        }
        return Utils.download(fileName, url).then(function(doc) {
            console.log('Done. File "' + fileName + '". ');
            return true;
        })
    }));
}
