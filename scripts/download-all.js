var _ = require('underscore');
var Q = require('q');
var Utils = require('./fetch-utils');
var Path = require('path');
var FS = require('fs');
var Url = require('url');

var dataFolder = '../data';
var datasets = require('./datasets.js')

return Q().then(function() {
    return downloadAll(dataFolder, datasets).then(function() {
        return Q.all(_.map(datasets, function(dataset) {
            var fileName = Path.join(dataFolder, dataset.path);
            return Utils.readCsv(fileName, function(obj) {
                obj = transformToGeoJson(dataset, obj);
                console.log(JSON.stringify(obj));
            }, dataset.csvOptions || {
                delim : ';'
            });
        }));
    });
}).fail(function(err) {
    console.log(err);
}).done();

function isEmpty(str) {
    return !str || str == '';
}

function transformToGeoJson(dataset, obj) {
    if (_.isFunction(dataset.transform)) {
        return dataset.transform(obj);
    }
    return obj;
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
