/*jslint node: true */
'use strict';
var PostGisUtils = require('mosaic-distil/postgis-utils');
var pSQLClient;
var Q = require('q');
var FS = require('fs');
var path = require('path');

var imported = 0, total = 0;
var dataDir = '../data/';

if (process.argv.length < 3) {
    console.log('Usage: node import-all.js user [password]');
    process.exit();
}
var params = {
    url: 'postgres://' + (process.argv[2] || 'postgres') + ':' + process.argv[3] + '@localhost/<%=dbname%>',
    dbname: 'je_suis_ici'
};

function onError(err) {
    console.error(err.toString());
    process.exit();
}

function importCount() {
    imported += 1;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('Imported ' + imported + ' of ' + total);
    if (imported === total) {
        console.log("\nFinished !");
        process.exit();
    }
}

function toSql(obj) {
    PostGisUtils.runQuery(pSQLClient, PostGisUtils.toPostGisSql(obj, params)).then(importCount, onError);
}

function loopJson(json) {
    total += json.length;
    json.forEach(toSql);
}

function listDir(dir) {
    return Q.nfcall(FS.readdir, dir);
}

function getJson(file) {
    if (path.extname(file) === '.json') {
        console.log('Reading ' + file + '…');
        PostGisUtils.readJson(dataDir + file).then(loopJson, onError);
    }
}

function loopFiles(files) {
    files.forEach(getJson);
}

function getFiles() {
    listDir(dataDir).then(loopFiles, onError);
}

function generateViews() {
    console.log("Generating views…");
    PostGisUtils.runQuery(pSQLClient, PostGisUtils.generateTableViewsSQL(params)).then(getFiles, onError);
}

function generateIndexes() {
    console.log("Generating indexes…");
    PostGisUtils.runQuery(pSQLClient, PostGisUtils.generateTableIndexesSQL(params)).then(generateViews, onError);
}

function generateTable(client) {
    console.log("Generating table…");
    pSQLClient = client;
    PostGisUtils.runQuery(client, PostGisUtils.generateTableCreationSQL(params)).then(generateIndexes, onError);
}

PostGisUtils.newConnection(params).then(generateTable, onError);
