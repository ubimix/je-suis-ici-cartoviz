(function(context) {
    $(function() {
        var mapElement = $('#map');
        var center = mapElement.data('center') || [ 0, 0 ];
        center = [ center[1], center[0] ];
        var zoom = mapElement.data('zoom');
        var minZoom = mapElement.data('min-zoom') || 2;
        var maxZoom = mapElement.data('max-zoom') || 18;

        console.log('center:', center);
        console.log('minZoom:', minZoom);
        console.log('maxZoom:', maxZoom);
        console.log('zoom:', zoom);

        var layers = [];
        mapElement.find('[data-type="layer"]').each(function() {
            var elm = $(this);
            var tilesUrl = elm.data('tiles-url');
            if (tilesUrl) {
                console.log(tilesUrl)
                var attributionElm = elm.find('.attribution');
                var attribution = attributionElm.html();
                attributionElm.remove();
                var tilesLayer = L.tileLayer(tilesUrl, {
                    attribution : attribution,
                    minZoom : minZoom,
                    maxZoom : maxZoom,
                });
                layers.push(tilesLayer);
            }
            var utfgridUrl = elm.data('utfgrid-url');
            if (utfgridUrl) {
                var utfGrid = new L.UtfGrid(utfgridUrl);
                var template = _.template(elm.text());
                var panelSelector = elm.data('panel') || '#info';
                var action = elm.data('action') || 'mouseover';
                utfGrid.on(action, function(ev) {
                    var panel = $(panelSelector);
                    var data = ev.data;
                    if (_.isString(data.properties)) {
                        data.properties = JSON.parse(data.properties);
                    }
                    if (_.isString(data.geometry)) {
                        data.geometry = JSON.parse(data.geometry);
                    }
                    console.log(data);
                    var html = template(data);
                    panel.html(html);
                    panel.show();
                });
                layers.push(utfGrid);
            }
        })
        mapElement.html('');

        var map = L.map(mapElement[0]).setView(center, zoom);
        _.each(layers, function(layer) {
            map.addLayer(layer);
        })

        map.on('click', function(e) {
            console.log(map.getZoom() + ' [' + e.latlng.lng + ','
                    + e.latlng.lat + ']');
        })

    });

})(this);