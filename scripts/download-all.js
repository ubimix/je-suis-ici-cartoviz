var _ = require('underscore');
var Q = require('q');
var Utils = require('./fetch-utils');
var Path = require('path');
var FS = require('fs');
var Url = require('url');

var dataFolder = '../data';
var datasets = require('./datasets.js')

function setExtension(fileName, newExt) {
    return Path.join(Path.dirname(fileName), Path.basename(fileName, Path
            .extname(fileName))
            + newExt);
}

return Q().then(function() {
    return downloadAll(dataFolder, datasets).then(function() {
        return Q.all(_.map(datasets, function(dataset) {
            var fileName = Path.join(dataFolder, dataset.path);
            var destFile = setExtension(fileName, '.json');
            var output = FS.createWriteStream(destFile, {
                flags : 'w',
                encoding : 'UTF-8'
            });
            var counter = 0;
            console.log('Transforming the file ');
            console.log('  - "' + fileName + '"');
            console.log(' to ');
            console.log('  - "' + destFile + '"');
            output.write('[\n');
            return Utils.readCsv(fileName, function(obj) {
                if (counter > 0) {
                    output.write(',\n');
                }
                obj = transformToGeoJson(dataset, obj);
                var str = JSON.stringify(obj, null, 2);
                output.write(str);
                if ((++counter % 100) == 0) {
                    console.log(' * ' + counter);
                }
            }, dataset.csvOptions || {
                delim : ';'
            }).fin(function() {
                output.end(']');
                console.log('Done (' + counter + ' records).');
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
