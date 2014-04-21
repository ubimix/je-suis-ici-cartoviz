$(function() {
    var appConfig = {
        templatesSelector : '#templates',
        mapSelector : '#map',
        listSelector : '#list',
        datalayersSelector : '#map [data-map-layer]'
    }

    var application = new Mosaic.AppConfigurator(appConfig);
    application.start();
});
