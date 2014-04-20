(function(context) {
    var P = Q;

    $(initialize);

    var appConfig = {
        templatesSelector : '#templates',
        mapSelector : '#map',
        datalayersSelector : '#map [data-map-layer]'
    }

    function initialize() {
        var application = new Mosaic.AppConfigurator(appConfig);
        loadJson('./data/data.json').then(function(data) {
            application.addGeoJsonDataSet(data, {
                clusterPoints : true,
            });
        }).then(function() {
            application.start();
        }).done();
    }

    /**
     * Return a promise for the data loaded from the specified URL
     */
    function loadJson(url) {
        var deferred = Mosaic.Promise.defer();
        $.get(url, function(data) {
            deferred.resolve(data);
        }).fail(function(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

})(this);