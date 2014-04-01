var $ = require('cheerio');
var Request = require('superagent');
var Q = require('q');
var _ = require('underscore');
var FS = require('fs');
var crypto = require('crypto');
var Path = require('path');
var Url = require('url');
var CsvSplitter = require('./csv-splitter');
var Readline = require('readline');
var Http = require('http');

/* -------------------------------- */
module.exports = {
    // Text utils
    normalize : normalize,
    trim : trim,
    isEmpty : isEmpty,

    // SHA1
    hash : hash,

    getFileNameFromUrl : getFileNameFromUrl,

    // HTTP loading
    loadPage : loadPage,
    load : load,
    download : download, // Download in a file

    // FS IO
    checkDir : checkDir,
    writeText : writeText,
    readText : readText,
    writeJson : writeJson,
    readJson : readJson,

    readCsvAsObjects : readCsvAsObjects,
    readCsv : readCsv,

    // HTML utils
    resolve : resolve,
    resolveRefs : resolveRefs,
    toHtml : toHtml,
    toText : toText,
    toGeo : toGeo,

    parseGeoPoint : parseGeoPoint
}

function readCsvAsObjects(file, options) {
    var results = [];
    return readCsv(file, function(obj) {
        results.push(obj);
    }, options).then(function() {
        return results;
    });
}

function readCsv(file, callback, options) {
    var deferred = Q.defer();
    try {
        var first = true;
        headers = options.headers;
        options = options || {
            delim : ','
        };
        var splitter = new CsvSplitter(options);
        Readline.createInterface({
            input : FS.createReadStream(file),
            terminal : false
        }).on('line', function(line) {
            var array = splitter.splitCsvLine(line);
            array = _.map(array, function(str) {
                str = trim(str);
                return str;
            });
            if (!headers) {
                headers = array;
            } else {
                var obj = splitter.toObject(headers, array);
                callback(obj);
            }
        }).on('close', function() {
            deferred.resolve();
        });
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise;
}

function toGeo(elm) {
    var str = $($(elm)[0]).text();
    return parseGeoPoint(str);
}

function parseGeoPoint(str) {
    var array = str.split(/\s*,\s*/gim);
    try {
        return [ parseFloat(array[1]), parseFloat(array[0]) ];
    } catch (e) {
        return undefined;
    }
}

/* -------------------------------- */
function resolve(url, e, tag, attr) {
    e.find(tag).each(function() {
        var href = $(this).attr(attr);
        href = Url.resolve(url, href);
        $(this).attr(attr, href);
    })
}
function resolveRefs(url, e) {
    resolve(url, e, 'a', 'href');
    resolve(url, e, 'img', 'src');
}

function toHtml(url, str) {
    str = normalize(str);
    str = '<div>' + str + '</div>';
    var e = $(str);
    resolve(url, e, 'a', 'href');
    resolve(url, e, 'img', 'src')
    return e;
}
function toText(url, str) {
    return normalize(toHtml(url, str).text());
}

function normalize(str) {
    return trim(str).replace(/\s+/gim, ' ');
}

function isEmpty(str) {
    if (!str)
        return true;
    return str == '';
}
function trim(str) {
    if (!str)
        return '';
    return str.replace(/^\s+|\s+$/gim, '');
}

function hash(str) {
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

function getFileNameFromUrl(url, ext) {
    var o = Url.parse(url);
    // var fileName = hash(url) + '.html';
    ext = ext || '';
    var fileName = o.host + '-' + Path.basename(o.pathname) + ext;
    return fileName;
}

function checkDir(dir) {
    function f() {
    }
    return Q.nfcall(FS.mkdir, dir).then(f, f);
}

function loadPage(options) {
    var dir = options.dir;
    var url = options.url;
    var reload = options.reload;
    return checkDir(dir).then(function() {
        var fileName = dir + getFileNameFromUrl(url, '.html');
        if (!reload && FS.existsSync(fileName)) {
            return readText(fileName).then(function(str) {
                return $(str);
            });
        } else {
            return load(url).then(function(doc) {
                return writeText(fileName, doc).then(function() {
                    return $(doc);
                })
            })
        }
    });
}

function load(url) {
    var deferred = Q.defer();
    try {
        Request.get(url, deferred.makeNodeResolver());
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise.then(function(res) {
        return res.text;
    });
}
function download(dataFileName, url, maxRedirects) {
    var that = this;
    maxRedirects = maxRedirects || 10;
    function httpGet(options, redirectCount) {
        var diferred = Q.defer();
        try {
            if (redirectCount >= maxRedirects) {
                throw new Error('Too many redirections. (' + redirectCount
                        + ').');
            }
            Http.get(options, function(res) {
                try {
                    var result = null;
                    if (res.statusCode > 300 && res.statusCode < 400
                            && res.headers.location) {
                        var location = res.headers.location;
                        var newUrl = Url.parse(location);
                        if (!newUrl.hostname) {
                            options.path = location;
                        }
                        result = httpGet(newUrl, redirectCount++);
                    } else {
                        result = res;
                    }
                    diferred.resolve(result);
                } catch (e) {
                    diferred.reject(e);
                }
            });
        } catch (e) {
            diferred.reject(e);
        }
        return diferred.promise;
    }
    var dataDir = Path.dirname(dataFileName);
    function f() {
    }
    return Q.nfcall(FS.mkdir, dataDir).then(f, f).then(function() {
        var options = Url.parse(url);
        return httpGet(options, 0).then(function(res) {
            var diferred = Q.defer();
            try {
                var file = FS.createWriteStream(dataFileName);
                res.pipe(file);
                file.on('finish', function() {
                    file.close();
                    diferred.resolve(true);
                });
            } catch (e) {
                diferred.reject(e);
            }
            return diferred.promise;
        });
    });
}

function writeText(file, str) {
    return Q.nfcall(FS.writeFile, file, str);
}
function readText(file) {
    return Q.nfcall(FS.readFile, file, 'utf8');
}

function writeJson(file, obj) {
    var str = JSON.stringify(obj, null, 2);
    return writeText(file, str);
}

function readJson(file) {
    return readText(file).then(function(str) {
        return JSON.parse(str);
    });
}
