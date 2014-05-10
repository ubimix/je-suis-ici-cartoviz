$(function() {
    var appConfig = {
        templatesSelector : '#templates',
        datalayersSelector : '[data-map-layer]'
    }
    var application = new Mosaic.AppConfigurator(appConfig);
    application.start();
});
