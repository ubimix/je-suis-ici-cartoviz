var _ = require('underscore');
var Q = require('q');
var Utils = require('./fetch-utils');
var Path = require('path');
var FS = require('fs');
var Url = require('url');

var dataFolder = '../data';
var datasets = require('./datasets.js')

// * Drop tables
// * Create tables
// * Fill the tables with data
// * Index tables
// * Create views (?) for windshaft

function writeObjectToDb(connection, obj) {
    // * Transform to SQL
    // * Execute the query
    // * Return a promise
}

function Listener(options) {
    this.initialise(options);
}
_.extend(Listener.prototype, {
    initialise : function(options) {
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
    initialise : function(options) {
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
        console.log('Transforming the file ');
        console.log('  - "' + info.fileName + '"');
        console.log(' to ');
        console.log('  - "' + info.destFile + '"');
        info.output.write('[\n');
        return Q();
    },
    onEndDataset : function(dataset) {
        var info = this.index[dataset.path];
        info.output.end(']');
        console.log('Done (' + dataset.path + ' : ' + info.counter
                + ' records).');
        delete this.index[dataset.path];
        return Q();
    },
    onDatasetEntity : function(dataset, entity) {
        var info = this.index[dataset.path];
        var obj = this._transformToGeoJson(dataset, entity);
        var str = JSON.stringify(obj, null, 2);
        info.output.write(str);
        info.counter++;
        if ((info.counter % 1000) == 0) {
            console.log(' * ' + dataset.path + ' : ' + info.counter);
        }
        return Q();
    },
    _setExtension : function(fileName, newExt) {
        return Path.join(Path.dirname(fileName), Path.basename(fileName, Path
                .extname(fileName))
                + newExt);
    },
    _transformToGeoJson : function(dataset, obj) {
        if (_.isFunction(dataset.transform)) {
            return dataset.transform(obj);
        }
        return obj;
    }

});

function handleAll(dataFolder, dataSets, listener) {
    return listener.onBegin(dataSets).then(function() {
        return downloadAll(dataFolder, dataSets).then(function() {
            return Q.all(_.map(datasets, function(dataset) {
                return listener.onBeginDataset(dataset).then(function() {
                    var fileName = Path.join(dataFolder, dataset.path);
                    var csvOptions = dataset.csvOptions || {};
                    return Utils.readCsv(fileName, function(obj) {
                        return listener.onDatasetEntity(dataset, obj);
                    }, csvOptions);
                }).fin(function() {
                    return listener.onEndDataset(dataset);
                })
            }));
        });
    }).fin(function(result) {
        return listener.onEnd(dataSets);
    });
}

return handleAll(dataFolder, datasets, new WriteListener({
    dataFolder : dataFolder
})).fail(function(err) {
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
