(function(context) {
    $(function() {
        var mapElement = $('#map');
        var tilesUrl = mapElement.data('tiles-url');
        var utfgridUrl = mapElement.data('utfgrid-url');
        var attributionElm = mapElement.find('.attribution');
        var attribution = attributionElm.html();
        mapElement.html('');
        var center = mapElement.data('center');
        var zoom = mapElement.data('zoom');
        var minZoom = mapElement.data('min-zoom') || 2;
        var maxZoom = mapElement.data('max-zoom') || 18;

        console.log('tilesUrl:', tilesUrl);
        console.log('utfgridUrl:', utfgridUrl);
        console.log('center:', center);
        console.log('minZoom:', minZoom);
        console.log('maxZoom:', maxZoom);
        console.log('zoom:', zoom);

        var map = L.map(mapElement[0]).setView(center, zoom);
        var tiles = L.tileLayer(tilesUrl, {
            attribution : attribution,
            minZoom : minZoom,
            maxZoom : maxZoom,
        });
        map.addLayer(tiles);

        if (utfgridUrl) {
            var utfGrid = new L.UtfGrid(utfgridUrl);
            map.addLayer(utfGrid);
            utfGrid.on('mouseover', function(ev) {
                showInfo(ev.data);
            })
        }

        map.on('click', function(e) {
            console.log(map.getZoom() + ' [' + e.latlng.lng + ','
                    + e.latlng.lat + ']');
        })

    });
    function showInfo(data) {
        var panel = $('#info');
        console.log(panel[0])
        panel.find('[data-placeholder]').each(function() {
            var elm = $(this);
            var field = elm.data('placeholder');
            console.log(field, data[field]);
            elm.text(data[field]);
        })
        panel.show();
    }

})(this);